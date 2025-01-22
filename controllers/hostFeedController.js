const User = require('../models/User');
const Host = require('../models/Host');
const { calculateAge } = require('../utils/calculateAge');

const getFeed = async (req, res) => {
  const { host_id } = req.body;

  try {
    const host = await Host.findById(host_id);

    if (!host) {
      return res.status(404).json({ msg: 'Host not found' });
    }

    const { age_range, LookingFor, interest } = host;
    const hostInterests = interest.map(i => i.trim().toLowerCase());

    // Fetch all users without pagination first
    const allUsers = await User.find().select(`
      _id username gender Date_of_Birth LookingFor interest profile_url
    `);

    // Filter preferred users
    const preferredUsers = allUsers.filter(user => {
      const userAge = calculateAge(user.Date_of_Birth);
      const userGender = user.gender;
      const userInterests = user.interest.map(i => i.trim().toLowerCase());
      const hasMatchingInterest = hostInterests.some(interest => userInterests.includes(interest));

      return (
        (userGender === LookingFor) || 
        hasMatchingInterest
      );
    });

    // Filter non-preferred users
    const otherUsers = allUsers.filter(user => {
      const userAge = calculateAge(user.Date_of_Birth);
      const userGender = user.gender;
      const userInterests = user.interest.map(i => i.trim().toLowerCase());
      const hasMatchingInterest = hostInterests.some(interest => userInterests.includes(interest));

      return !(
        (userGender === LookingFor) || 
        hasMatchingInterest
      );
    });

    // Combine preferred and other users
    const combinedUsers = [
      ...preferredUsers,
      ...otherUsers
    ];

    // Returning specific fields for the users
    const relevantUsers = combinedUsers.map(user => ({
      user_id: user._id,
      username: user.username,  
      gender: user.gender,
      Date_of_Birth: user.Date_of_Birth,
      LookingFor: user.LookingFor,
      interest: user.interest,
      profile_url:`${req.protocol}://${req.get('host')}${user.profile_url}`,
    }));

    // Returning the paginated list of users
    res.json({
      preferredUsers: relevantUsers,
      totalUsers: combinedUsers.length,  // Total number of users for pagination info
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Users' });
  }
};

module.exports = {
  getFeed,
};
