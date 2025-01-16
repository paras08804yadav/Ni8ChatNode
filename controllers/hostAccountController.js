const Host = require('../models/Host'); 
const Media = require('../models/Media'); 
const { compressAndSaveImage } = require('../utils/imageUtils');
const { upload } = require('../utils/multerConfig'); 
const moment = require('moment');

const account = async (req, res) => {
    const { host_id } = req.body;

    if (!host_id) {
        return res.status(400).json({ msg: 'Please provide host_id.' });
    }

    try {
        // Find the host by their ID
        const host = await Host.findById(host_id);

        // Check if the host exists
        if (!host) {
            return res.status(404).json({ msg: 'Host not found.' });
        }

        // Calculate host's age in years based on Date_of_Birth
        const age = moment().diff(moment(host.Date_of_Birth), 'years');
        
        profile_url = `${req.protocol}://${req.get('host')}/uploads/profile_photo/${host_id}.jpg`;
    
        // Count the followers
        const followersCount = host.followers_list.length;

        // Count the total posts (images + videos)
        const totalPosts = await Media.countDocuments({ host_id });

        // Return the required host details in the response
        res.status(200).json({
            msg: 'Host details retrieved successfully',
            host: {
                hostname: host.hostname,
                profile_url: profile_url,
                gender: host.gender,
                languages : host.languages,
                age: host.Date_of_Birth,
                bio: host.bio,
                coins: host.coins,
                followers_count: followersCount,  // Followers count
                posts_count: totalPosts,          // Total posts (images + videos)
            }
        });

    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

  



  
const accountEdit = async (req, res) => {
    console.log("Request received for account edit.");
    upload(req, res, async (err) => {
        console.log("File upload middleware completed.");
        const { host_id, Date_of_Birth, languages, hostname, gender, bio, profile_url } = req.body;

        if (err) {
            console.error("File upload error:", err.message);
            return res.status(400).json({ msg: err.message });
        }

        if (!host_id) {
            console.warn("Host ID not provided.");
            return res.status(400).json({ msg: 'Please provide host_id.' });
        }

        try {
            console.log("Searching for host with ID:", host_id);
            const host = await Host.findById(host_id);
            if (!host) {
                console.warn("Host not found for ID:", host_id);
                return res.status(404).json({ msg: 'Host not found.' });
            }

            if (Date_of_Birth) {
                console.log("Validating Date of Birth:", Date_of_Birth);
                const dob = moment(Date_of_Birth, 'DD-MM-YYYY', true);
                if (!dob.isValid()) {
                    console.error("Invalid Date of Birth format.");
                    return res.status(400).json({ msg: 'Invalid Date of Birth format. Use DD-MM-YYYY.' });
                }

                const age = moment().diff(dob, 'years');
                console.log("Calculated age:", age);
                if (age < 18) {
                    console.warn("Host is a minor.");
                    return res.status(400).json({ msg: 'host cannot be a minor.' });
                }
                host.Date_of_Birth = dob.utc(); // Save as Date object
            }

            if (languages) {
                console.log("Updating languages:", languages);
                host.languages = languages;
            }

            if (hostname) {
                console.log("Updating hostname:", hostname);
                host.hostname = hostname;
            }

            if (gender) {
                console.log("Updating gender:", gender);
                host.gender = gender;
            }

            if (bio) {
                console.log("Updating bio.");
                host.bio = bio;
            }

            if (req.file) {
                console.log("Processing uploaded file for profile picture.");
                try {
                    req.file.originalname= `${host_id}`;
                    const compressedImagePath = await compressAndSaveImage(req.file.buffer, req.file.originalname);
                    host.profile_url = compressedImagePath; // Update host profile URL with compressed image path
                    console.log("Profile picture processed and saved at:", compressedImagePath);
                } catch (imageError) {
                    console.error("Error processing the image:", imageError.message);
                    return res.status(500).json({ msg: 'Error processing the image.', error: imageError.message });
                }
            }

            console.log("Saving updated host information.");
            await host.save();

            console.log("Host information updated successfully.");
            res.status(200).json({
                msg: 'Host info updated successfully',
                host: {
                    hostname: host.hostname,
                    gender: host.gender,
                    Date_of_Birth: moment(host.Date_of_Birth).format('DD-MM-YYYY'),
                    languages: host.languages,
                    bio: host.bio,
                    profile_url: host.profile_url || profile_url,
                }
            });
        } catch (error) {
            console.error("Server error:", error.message);
            res.status(500).json({ msg: 'Server error', error: error.message });
        }
    });
};
 


// Forget Password API
const forgetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    // Check if all required fields are provided
    if (!email || !newPassword) {
        return res.status(400).json({ msg: 'Please provide email and newPassword.' });
    }
  
    try {
        // Find host by email and host_id
        const host = await Host.findOne({ email });
        if (!host) {
            return res.status(404).json({ msg: 'host not found.' });
        }
  
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
  
        // Update the host's password
        host.password = hashedPassword;
        await host.save();
  
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