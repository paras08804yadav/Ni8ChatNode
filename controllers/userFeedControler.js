const User = require('../models/User');
const Host = require('../models/Host');
const { calculateAge } = require('../utils/calculateAge');

const getFeed = async (req, res) => {
  const { user_id } = req.body; // Default to page 1 and 10 hosts per page

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { age_range, LookingFor, interest } = user;

    // Parse age range and interests
    let [minAge, maxAge] = age_range.split('-').map(Number);
    const userInterests = interest.map(i => i.trim().toLowerCase());

    // Find all hosts for filtering
    const allHosts = await Host.find().select(`
      _id hostname gender location country Date_of_Birth LookingFor 
      languages interest bio social_id profile_url rank 
      audio_rate video_rate chat_rate rating followers
    `);

    // Filter hosts based on user's preferences
    const preferredHosts = allHosts.filter(host => {
      const hostAge = calculateAge(host.Date_of_Birth);
      const hostGender = host.gender;
      const hostInterests = host.interest.map(i => i.trim().toLowerCase());
      const hasMatchingInterest = userInterests.some(interest => hostInterests.includes(interest));

      return (
        (hostAge >= minAge && hostAge <= maxAge) ||
        (hostGender === LookingFor) ||
        hasMatchingInterest
      );
    });

    // Get IDs of preferred hosts to exclude them from otherHosts
    const preferredHostIds = new Set(preferredHosts.map(host => host._id.toString()));

    // Filter out hosts from otherHosts if they are in preferredHosts
    const otherHosts = allHosts.filter(host => !preferredHostIds.has(host._id.toString()));

    // Apply pagination to preferredHosts
    const paginatedPreferredHosts = preferredHosts
      .map(host => ({
        host_id: host._id,
        hostname: host.hostname,
        gender: host.gender,
        location: host.location,
        country: host.country,
        Date_of_Birth: host.Date_of_Birth,
        LookingFor: host.LookingFor,
        languages: host.languages,
        interest: host.interest,
        bio: host.bio,
        social_id: host.social_id,
        profile_url: `${req.protocol}://${req.get('host')}/uploads/profile_photo/${host._id}.jpg`,
        rank: host.rank,
        audio_rate: host.audio_rate,
        video_rate: host.video_rate,
        chat_rate: host.chat_rate,
        rating: host.rating,
        followers: host.followers,
      }));

    // Apply pagination to otherHosts
    const paginatedOtherHosts = otherHosts
      .map(host => ({
        host_id: host._id,
        hostname: host.hostname,
        gender: host.gender,
        location: host.location,
        country: host.country,
        Date_of_Birth: host.Date_of_Birth,
        LookingFor: host.LookingFor,
        languages: host.languages,
        interest: host.interest,
        bio: host.bio,
        social_id: host.social_id,
        profile_url: `${req.protocol}://${req.get('host')}/uploads/profile_photo/${host._id}.jpg`,
        rank: host.rank,
        audio_rate: host.audio_rate,
        video_rate: host.video_rate,
        chat_rate: host.chat_rate,
        rating: host.rating,
        followers: host.followers,
      }));

    res.json({
      preferredHosts: paginatedPreferredHosts,
      otherHosts: paginatedOtherHosts,
      totalPreferredHosts: preferredHosts.length,
      totalOtherHosts: otherHosts.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hosts' });
  }
};

module.exports = {
  getFeed,
};
