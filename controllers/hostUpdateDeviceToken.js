const Host = require('../models/Host');

const updateDeviceToken = async (req, res) => {
    const { hostId, newDeviceToken } = req.body;
  
    if (!hostId || !newDeviceToken) {
      return res.status(400).json({ message: 'Host ID and new device token are required' });
    }
  
    try {
      // Update the device_tokens field for the specified user
      const updatedHost = await Host.findByIdAndUpdate(
        hostId,
        { device_tokens: newDeviceToken },
        { new: true } // Return the updated document
      );
  
      if (!updatedHost) {
        return res.status(404).json({ message: 'Host not found' });
      }
  
      res.status(200).json({ message: 'Device token updated successfully', host: updatedHost });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  };


module.exports = {
    updateDeviceToken,
};