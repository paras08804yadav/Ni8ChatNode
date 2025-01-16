const Host = require('../models/Host')



const searchHosts = async (req, res) => {
    try {
      const { search } = req.query; 
  
      if (!search) {
        return res.status(400).json({ message: 'Please provide a search term' });
      }
  
      
      const query = {
        $or: [
          { full_name: { $regex: search, $options: 'i' } },
          { hostname: { $regex: search, $options: 'i' } },  // Partial match for username (case-insensitive)
          { interest: { $regex: search, $options: 'i' } },  // Partial match for interest (case-insensitive)
          { gender: { $regex: search, $options: 'i' } },    // Partial match for gender (case-insensitive)
          { LookingFor: { $regex: search, $options: 'i' } } // Partial match for LookingFor (case-insensitive)
        ]
      };
      
      const hosts = await Host.find(query).select(`
       hostname gender location country Date_of_Birth LookingFor 
      languages interest bio social_id rank 
      audio_rate video_rate chat_rate rating followers
    `);
      
  
      // If no host found
      if (hosts.length === 0) {
        return res.status(404).json({ message: 'No hosts found matching your search criteria' });
      }

      const hostsWithProfileUrl = hosts.map((host) => ({
        ...host.toObject(),
        profile_url: `${req.protocol}://${req.get('host')}/uploads/profile_photo/${host._id}.jpg`,
      }));
  
      // Send hosts that match the search criteria
      res.json(hostsWithProfileUrl);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving hosts', error: error.message });
    }
  };

module.exports = {
    searchHosts,
}