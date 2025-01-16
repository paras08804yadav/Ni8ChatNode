const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const moment = require('moment');
const path = require('path');


const account = async (req, res) => {
    const { user_id } = req.body;

    // Validate input
    if (!user_id) {
        return res.status(400).json({ msg: 'Please provide user_id.' });
    }

    try {
        // Find the user by their ID
        const user = await User.findById(user_id);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Calculate user's age in years based on Date_of_Birth
        const age = moment().diff(moment(user.Date_of_Birth), 'years');

        // Determine profile_url based on gender
        let profile_url = null;
        if (user.gender) {
            // Construct the profile_url based on gender
            switch (user.gender.toLowerCase()) {
                case 'male':
                    profile_url = `${req.protocol}://${req.get('host')}/Avtar/male.jpg`; // Ensure the path is correct
                    break;
                case 'female':
                    profile_url = `${req.protocol}://${req.get('host')}/Avtar/female.jpg`; // Ensure the path is correct
                    break;
                default:
                    profile_url = null; // No avatar for other genders or leave it empty
                    break;
            }
        }

        // Return the required user details in the response
        res.status(200).json({
            msg: 'User details retrieved successfully',
            user: {
                username: user.username,
                profile_url: profile_url, // Directly return the constructed URL
                gender: user.gender,
                Date_of_Birth: user.Date_of_Birth,
                age: age,
                coins: user.coins,
                languages: user.languages,
            }
        });

    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};
  
  
  
  const accountEdit = async (req, res) => {
    const { user_id, Date_of_Birth, languages, username, gender } = req.body;
  
    if (!user_id) {
        return res.status(400).json({ msg: 'User ID is required.' });
    }
  
    try {
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
  
        // Update Date of Birth
        if (Date_of_Birth) {
            // Check for minor condition (if you have a separate validation function)
            const dob = moment(Date_of_Birth, 'DD-MM-YYYY', true);
            if (!dob.isValid()) {
                return res.status(400).json({ msg: 'Invalid Date of Birth format. Use DD-MM-YYYY.' });
            }
            
            const age = moment().diff(dob, 'years');
            if (age < 18) {
                return res.status(400).json({ msg: 'User cannot be a minor.' });
            }
            user.Date_of_Birth = dob.toDate(); // Save as Date object
        }

        //update languages
        if (languages){
          user.languages=languages;
        }
  
        // Update username
        if (username) {
            user.username = username;
        }
  
        // Update gender
        if (gender) {
            user.gender = gender;
            if (user.gender) {
                // Construct the profile_url based on gender
                switch (user.gender.toLowerCase()) {
                    case 'male':
                        profile_url = `${req.protocol}://${req.get('host')}/Avtar/male.jpg`; // Ensure the path is correct
                        break;
                    case 'female':
                        profile_url = `${req.protocol}://${req.get('host')}/Avtar/female.jpg`; // Ensure the path is correct
                        break;
                    default:
                        profile_url = null; // No avatar for other genders or leave it empty
                        break;
                }
            }
        }
  
        await user.save();
  
        res.status(200).json({          
          msg: 'User info updated successfully',
          user: {
              username: user.username,
              gender: user.gender,
              Date_of_Birth: moment(user.Date_of_Birth).format('DD-MM-YYYY'),
              languages: user.languages,
              profile_url:user.profile_url,
          } });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
  };
  
  
// Forget Password API
const forgetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    // Check if all required fields are provided
    if (!email || !newPassword) {
        return res.status(400).json({ msg: 'Please provide email and newPassword.' });
    }
  
    try {
        // Find user by email and user_id
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
  
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
  
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
  
        res.status(200).json({ msg: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
  };


  module.exports = {
    account,
    accountEdit,
    forgetPassword,
  };