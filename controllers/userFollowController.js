const mongoose = require('mongoose');
const User = require('../models/User');
const Host = require('../models/Host');

// Function to follow a host
const followHost = async (req, res) => {
    try {
      const { user_id, host_id } = req.body;
  
      // Check if user_id and host_id are provided
      if (!user_id || !host_id) {
        return res.status(400).json({ success: false, message: 'User ID and Host ID are required' });
      }
  
      const user = await User.findById(user_id);
      const host = await Host.findById(host_id);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      if (!host) {
        return res.status(404).json({ success: false, message: 'Host not found' });
      }
  
      // Check if the user is already following the host
      if (host.followers_list.includes(user_id)) {
        return res.status(409).json({ success: false, message: 'User is already following this host' });
      }
  
      // Add user to the host's followers list
      host.followers_list.push(user._id);
      host.followers += 1;
      await host.save();
  
      // Add host to the user's followed hosts list
      user.followed_hosts.push(host._id);
      await user.save();
  
      return res.status(200).json({ success: true, message: `User ${user.full_name} followed Host ${host.full_name}`, followers: host.followers });
    } catch (error) {
      console.error('Error following the host:', error);
      return res.status(500).json({ success: false, message: 'Error following the host', error: error.message });
    }
  };


const unfollowHost = async (req, res) => {
    try {
      const { user_id, host_id } = req.body;
      
          // Check if user_id and host_id are provided
      if (!user_id || !host_id) {
        return res.status(400).json({ success: false, message: 'User ID and Host ID are required' });
      }
      
          // Fetch the user and host
      const user = await User.findById(user_id);
      const host = await Host.findById(host_id);
      
          // Check if the user exists
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
          // Check if the host exists
      if (!host) {
        return res.status(404).json({ success: false, message: 'Host not found' });
      }
      
          // Check if the user is not following the host
      if (!host.followers_list.includes(user_id)) {
        return res.status(409).json({ success: false, message: 'User is not following this host' });
      }
      
          // Remove the user from the host's followers list
      host.followers_list = host.followers_list.filter(id => id.toString() !== user_id);
      host.followers -= 1;
      await host.save();
      
          // Remove the host from the user's followed hosts list
      user.followed_hosts = user.followed_hosts.filter(id => id.toString() !== host_id);
      await user.save();
      
      return res.status(200).json({ success: true, message: `User ${user.full_name} unfollowed Host ${host.full_name}`, followers: host.followers });
      }catch (error) {
          console.error('Error unfollowing the host:', error);
          return res.status(500).json({ success: false, message: 'Error unfollowing the host', error: error.message });
        }
      };
      
  


module.exports = {
    followHost,
    unfollowHost,
};
