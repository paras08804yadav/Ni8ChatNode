const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken'); 

require('dotenv').config();
const secretKey = process.env.JWT_SECRET; 


const signup = async (req, res) => {
  const {username, email, password } = req.body;

  // Check if required fields are present
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please provide username, email, and password.' });
  }

  try {
    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let profile_url = null;
    let coins = 0;
    // Create the user
    user = new User({
      username,
      email,
      password: hashedPassword,
      profile_url, 
      coins
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '30d' });


    res.status(201).json({ msg: 'User created successfully', user: {id: user._id, username, email},token });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};


const updateUserInfo = async (req, res) => {
  const { user_id, gender, Date_of_Birth } = req.body;

  if (!user_id || !gender || !Date_of_Birth) {
      return res.status(400).json({ msg: 'Please provide user_id, gender, and Date_of_Birth.' });
  }

  if (!moment(Date_of_Birth, 'DD-MM-YYYY', true).isValid()) {
      return res.status(400).json({ msg: 'Please provide Date of Birth in DD-MM-YYYY format.' });
  }

  try {
      const user = await User.findById(user_id);
      if (!user) {
          return res.status(404).json({ msg: 'User not found.' });
      }

      const parsedDateOfBirth = moment(Date_of_Birth, 'DD-MM-YYYY').toDate();

      const age = moment().diff(moment(parsedDateOfBirth), 'years');

      // Check if age is less than 18
      if (age < 18) {
          return res.status(400).json({ msg: "User can't be a minor. Age must be 18 or older." });
      }
      
    if (user.gender) {
        switch (user.gender.toLowerCase()) {
            case 'male':
                profile_url = `${req.protocol}://${req.get('host')}/Avtar/male.jpg`; 
                break;

            case 'female':
                profile_url = `${req.protocol}://${req.get('host')}/Avtar/female.jpg`; 
                break;

            default:
                profile_url = null; 
                break;
        }
    }

      user.gender = gender;
      user.Date_of_Birth = parsedDateOfBirth;  
      user.profile_url = profile_url;
      await user.save();

      res.status(200).json({
          msg: 'User info updated successfully',
          user: {
              id: user._id,
              gender: user.gender,
              Date_of_Birth: user.Date_of_Birth,
              profile_url : user.profile_url,
          }
      });
  } catch (error) {
      res.status(500).json({ msg: 'Server error', error: error.message });
  }
};



const updateUserPreferences = async (req, res) => {
    const { user_id, LookingFor, interest, age_range } = req.body;

    if (!user_id || !LookingFor || !interest || !age_range) {
        return res.status(400).json({ msg: 'Please provide user_id, LookingFor, interest, and age_range.' });
    }

    try {
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        user.LookingFor = LookingFor;
        user.interest = interest;
        user.age_range = age_range;


        await user.save();

        res.status(200).json({ msg: 'User preferences updated successfully', user });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};



const login = async (req, res) => {
    const { identifier, password } = req.body;


    if (!identifier || !password) {
        return res.status(400).json({ msg: 'Please provide email/username and password.' });
    }

    try {
        let user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }] 
        });
        
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        // Compare the hashed password with the provided password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '30d' });

        // Login successful, return user info (excluding password)
        res.status(200).json({
            msg: 'Login successful',
            user: { 
                id: user._id,
                full_name: user.full_name,
                username: user.username,
                gender: user.gender,
                Date_of_Birth: user.Date_of_Birth,
                interest: user.interest,
                profile_url: user.profile_url,
                coins: user.coins,
            }, 
            token,
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
  signup,
  updateUserInfo,
  updateUserPreferences,
  login,
};

