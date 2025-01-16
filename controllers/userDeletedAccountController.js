const User = require('../models/User');  // Assuming your User model is in the models folder
const DeletedUser = require('../models/deletedUser');  // Assuming the DeletedUser schema is in the models folder

const deleteAccount = async (req, res) => {
    try {
        const { user_id } = req.body;  // Assuming you get the user_id from the body of the request

        // Find the user to delete
        const user = await User.findById(user_id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create a new DeletedUser object with all user details
        const deletedUser = new DeletedUser({
            user_id: user_id,
            username: user.username,
            email: user.email,
            password: user.password,
            phone_number: user.phone_number,
            gender: user.gender,
            location: user.location,
            country: user.country,
            Date_of_Birth: user.Date_of_Birth,
            LookingFor: user.LookingFor,
            languages: user.languages,
            interest: user.interest,
            age_range: user.age_range,
            device_tokens: user.device_tokens,
            bio: user.bio,
            coins: user.coins,
            device_id: user.device_id,
            social_id: user.social_id,
            device_ip: user.device_ip,
            profile_url: user.profile_url,
            rank: user.rank,
            followed_hosts: user.followed_hosts,
            deletedAt: Date.now(),
        });

        // Save the user data to DeletedUser collection
        await deletedUser.save();

        // Now delete the user from the User collection
        await User.findByIdAndDelete(user_id);

        return res.status(200).json({ success: true, message: 'Account deleted successfully and data preserved' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error deleting account', error: error.message });
    }
};

module.exports = {
  deleteAccount,  
};