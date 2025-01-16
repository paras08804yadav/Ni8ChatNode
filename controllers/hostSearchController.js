const Host = require('../models/Host');
const User = require('../models/User');



const searchUsers = async (req, res) => {
    try {
      const { search } = req.query; 
  
      if (!search) {
        return res.status(400).json({ message: 'Please provide a search term' });
      }
  
      
      const query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },  // Partial match for username (case-insensitive)
          { interest: { $regex: search, $options: 'i' } },  // Partial match for interest (case-insensitive)
          { gender: { $regex: search, $options: 'i' } },    // Partial match for gender (case-insensitive)
          { LookingFor: { $regex: search, $options: 'i' } } // Partial match for LookingFor (case-insensitive)
        ]
      };
      
      const users = await User.find(query).select(`
      full_name username gender  Date_of_Birth LookingFor 
       interest  
    `);
      
  
      // If no host found
      if (users.length === 0) {
        return res.status(404).json({ message: 'No user found matching your search criteria' });
      }

      const usersWithProfileUrl = users.map((user) => ({
        ...user.toObject(),
        profile_url: `${req.protocol}://${req.get('host')}/Avtar/${user.gender === 'Male' ? 'male.jpg' : 'female.jpg'}`,
      }));
  
      // Send hosts that match the search criteria
      res.json(usersWithProfileUrl);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
  };

module.exports = {
    searchUsers,
}