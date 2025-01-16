const User = require('../models/User');

const searchUserByName = async (req, res) => {
    const { username } = req.body; 

    // Validate the username
    if (!username) {
        return res.status(400).json({ msg: 'Please provide a username to search' });
    }

    try {
        // Search for users matching the username (case-insensitive)
        const users = await User.find(
            { username: { $regex: username, $options: 'i' } },
            'user_id username profile_url' 
        );

        if (users.length === 0) {
            return res.status(404).json({ msg: 'No users found with the provided username' });
        }

        // Update the profile_url for each user with the full URL
        const updatedUsers = users.map(user => ({
            user_id: user.user_id,
            username: user.username,
            profile_url: `${req.protocol}://${req.get('host')}${user.profile_url}`
        }));

        return res.status(200).json({
            msg: 'Users retrieved successfully',
            users: updatedUsers,
        });

    } catch (error) {
        // Handle server errors
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    searchUserByName,
};
