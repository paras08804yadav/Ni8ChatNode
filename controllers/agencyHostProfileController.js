const Host = require('../models/Host');
const Agency = require('../models/Agency');
const Media = require('../models/Media');

const getHostDetails = async (req, res) => {
    try {
      const { agency_id, host_id } = req.body; 
  
      if (!host_id || !agency_id) {
        return res.status(400).json({ message: 'Please provide a user_id and host_id' });
        
      }
  
      const host = await Host.findById(host_id).select(`
        hostname gender location country Date_of_Birth LookingFor 
        languages interest bio social_id profile_url rank 
        audio_rate video_rate chat_rate rating followers
      `);


  
      if (!host) {
        return res.status(404).json({ message: 'Host not found with the provided ID' });
      }

      res.json({
        host : {
        _id: host._id,
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
      }
  });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  const fetchUserImages = async (req, res) => {
    const { host_id } = req.body;

    // Validate that host_id is provided
    if (!host_id) {
        return res.status(400).json({ msg: 'Host ID is required.' });
    }

    try {
        // Find all media related to the host where media_type is 'image'
        const userImages = await Media.find({ host_id: host_id, media_type: 'image' });

        // If no images are found, return a 404 response
        if (userImages.length === 0) {
            return res.status(404).json({ msg: 'No images found for the host.' });
        }

        // Return the list of images
        res.status(200).json({
            msg: `Images for host ${host_id} retrieved successfully`,
            images: userImages
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

const fetchUserVideos = async (req, res) => {
    const { host_id } = req.body;

    // Validate that host_id is provided
    if (!host_id) {
        return res.status(400).json({ msg: 'Host ID is required.' });
    }

    try {
        // Find all media related to the host where media_type is 'video'
        const userVideos = await Media.find({ host_id: host_id, media_type: 'video' });

        // If no videos are found, return a 404 response
        if (userVideos.length === 0) {
            return res.status(404).json({ msg: 'No videos found for the host.' });
        }

        // Return the list of videos
        res.status(200).json({
            msg: `Videos for host ${host_id} retrieved successfully`,
            videos: userVideos
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};


  module.exports = {
    getHostDetails,
    fetchUserImages,
    fetchUserVideos,
  };
  