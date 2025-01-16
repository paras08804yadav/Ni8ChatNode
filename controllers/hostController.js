const User = require('../models/User'); 
const Host = require('../models/Host');
const { upload } = require('../utils/multerConfig'); 
const { compressAndSaveImage } = require('../utils/imageUtils');
const Agency = require('../models/Agency');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken'); 

require('dotenv').config();
const secretKey = process.env.JWT_SECRET; 




const signup = async (req, res) => {
    const { agencyname, hostname, email, password, type } = req.body; 

    if ( !email || !password || !type) {
        return res.status(400).json({ msg: 'Please provide type, hostname, email, and password.' });
    }

    try {
        if (type==="Host"){
        let host = await Host.findOne({ $or: [{ email }, { hostname }] }); 
        if (host) {
            return res.status(400).json({ msg: 'Host with this email or hostname already exists.' });
            }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        host = new Host({
            hostname, 
            email,
            password: hashedPassword,
            });
        
            await host.save();
            const token = jwt.sign({ id: host._id }, secretKey, { expiresIn: '30d' });

            res.status(201).json({ msg: 'Host created successfully', host: { id: host._id, hostname, email }, token });
        }
        else if((type==="Agency"))
        {
            let agency = await Agency.findOne({ $or: [{ email }, { agencyname }] }); 
            if (agency) {
                return res.status(400).json({ msg: 'Agency with this email or agencyname already exists.' });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            agency = new Agency({
                agencyname, 
                email,
                password: hashedPassword,
            });
            
            await agency.save();
            const token = jwt.sign({ id: agency._id }, secretKey, { expiresIn: '30d' });

            res.status(201).json({ msg: 'Agency created successfully', agency: { id: agency._id, agencyname, email },token });
        }
        else{
            return res.status('Please provide type')
        }

    }catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};




const updateHostInfo = async (req, res) => {
        const { host_id, gender, Date_of_Birth } = req.body;


        if (!host_id || !gender || !Date_of_Birth) {
            return res.status(400).json({ msg: 'Please provide host_id, gender, Date_of_Birth.' });
        }


        try {
            const host = await Host.findById(host_id);
            if (!host) {
                return res.status(404).json({ msg: 'Host are not found in DB.' });
            }



            // Save the updated host information to the database
            await host.save();
            // Send response with updated host information
            res.status(200).json({
                msg: 'Host info updated successfully',
                host: {
                    id: host._id,
                    gender: gender,
                    Date_of_Birth: Date_of_Birth,
                }
            });
        } catch (error) {
            // Handle any server errors
            res.status(500).json({ msg: 'Server error', error: error.message });
        };
};



const updateHostPreferences = async (req, res) => {
    const { host_id, LookingFor, interest, languages} = req.body;

    if (!host_id || !LookingFor || !interest ) {
        return res.status(400).json({ msg: 'Please provide host_id, LookingFor, interest and languages.' });
    }

    try {
        const host = await Host.findById(host_id).select(`
          full_name username gender location country Date_of_Birth LookingFor 
          languages interest bio social_id profile_url rank 
          audio_rate video_rate chat_rate rating followers
          `);
        if (!host) {
            return res.status(404).json({ msg: 'Host not found.' });
        }

        host.LookingFor = LookingFor;
        host.interest = interest;
        host.languages = languages;

        await host.save();

        res.status(200).json({ msg: 'Host preferences updated successfully', host });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};



const getUserDetails = async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ msg: 'Please provide a valid user_id.' });
    }

    try {
        // Find user by user_id
        const user = await User.findById(user_id).select(`
          full_name username gender Date_of_Birth LookingFor 
           interest  profile_url 
        `);
          
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Return the user details
        res.status(200).json({
            msg: 'User details fetched successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};



const login = async (req, res) => {
    const { identifier, password, type } = req.body;


    if (!identifier || !password || !type) {
        return res.status(400).json({ msg: 'Please provide email/hostname ,password and type.' });
    }
    try {
        if(type==="Host"){
        
        let host = await Host.findOne({
            $or: [{ email: identifier }, { hostname: identifier }] 
        });

        if (!host) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, host.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: host._id }, secretKey, { expiresIn: '30d' });


        // Login successful, return user info (excluding password)
        res.status(200).json({
            msg: 'Login successful',
            user: { 
                id: host._id,
                full_name: host.full_name,
                username: host.username,
                gender: host.gender,
                Date_of_Birth: host.Date_of_Birth,
                interest: host.interest,
                profile_url: host.profile_url
            },
            token,
        });
        }
        if(type==="Agency"){
        
            let agency = await Agency.findOne({
                $or: [{ email: identifier }, { agencyname: identifier }] 
            });
    
            if (!agency) {
                return res.status(400).json({ msg: 'Invalid credentials.' });
            }
            const isMatch = await bcrypt.compare(password, agency.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials.' });
            }
            const token = jwt.sign({ id: agency._id }, secretKey, { expiresIn: '30d' });

            // Login successful, return user info (excluding password)
            res.status(200).json({
                msg: 'Login successful',
                agency: { 
                    id:agency._id,
                    full_name: agency.full_name,
                }, 
                token,
            });
        
     }
    }catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
    
};

module.exports = {signup, updateHostInfo, updateHostPreferences, getUserDetails, login };
