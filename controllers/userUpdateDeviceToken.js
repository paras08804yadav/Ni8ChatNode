const User = require('../models/User');

const updateDeviceToken = async (req, res) => {
    const { userId, newDeviceToken } = req.body;
  
    if (!userId || !newDeviceToken) {
      return res.status(400).json({ message: 'User ID and new device token are required' });
    }
  
    try {
      // Update the device_tokens field for the specified user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { device_tokens: newDeviceToken },
        { new: true } // Return the updated document
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'Device token updated successfully', user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  };


module.exports = {
    updateDeviceToken,
};