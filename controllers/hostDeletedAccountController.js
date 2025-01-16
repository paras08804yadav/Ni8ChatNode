const Host = require('../models/Host');  // Assuming your host model is in the models folder
const DeletedHost = require('../models/deletedHost');  // Assuming the Deletedhost schema is in the models folder

const deleteAccount = async (req, res) => {
    try {
        const { host_id } = req.body;  // Assuming you get the host_id from the body of the request

       if(!host_id){
        return res.status(404).json({ success: false, message: 'host_id is missed in parameter' });
       }

        // Find the host to delete
        const host = await Host.findById(host_id);
        
        if (!host) {
            return res.status(404).json({ success: false, message: 'Host not found' });
        }

        // Create a new Deletedhost object with all host details
        const deletedHost = new DeletedHost({
            host_id: host_id,
            hostname: host.hostname,
            agency_id: host.agency_id,
            email: host.email,
            password: host.password,
            phone_number: host.phone_number,
            gender: host.gender,
            location: host.location,
            country: host.country,
            Date_of_Birth: host.Date_of_Birth,
            LookingFor: host.LookingFor,
            languages: host.languages,
            interest: host.interest,
            age_range: host.age_range,
            device_tokens: host.device_tokens,
            bio: host.bio,
            coins: host.coins,
            device_ip: host.device_ip,
            social_id: host.social_id,
            device_ip: host.device_ip,
            profile_url: host.profile_url,
            rank: host.rank,
            audio_rate: host.audio_rate,
            video_rate: host.video_rate,
            chat_rate: host.chat_rate,
            rating: host.rating,
            followers: host.followers,
            followers_list: host.followers_list,
        });


        await deletedHost.save();
        await Host.findByIdAndDelete(host_id);

        return res.status(200).json({ success: true, message: 'Account deleted successfully and data preserved' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error deleting account', error: error.message });
    }
};

module.exports = {
  deleteAccount,  
};

