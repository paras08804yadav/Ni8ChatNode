const UserIsOnline = require('../models/user_isOnline'); 
const HostIsOnline = require('../models/host_isOnline'); 



const id_generate = async (req, res) => {
    
    const { userId, user_generatedID } = req.body;

    if (!userId || !user_generatedID) {
        return res.status(400).json({ error: 'username and user_generatedID are required' });
    }

    try {
        // Find the user by username and update if exists, else create a new document
        const user = await UserIsOnline.findOneAndUpdate(
            { userId }, // Query to find the user
            {
                user_generatedID, // Update the ID
                timestamp: Date.now() // Update the timestamp
            },
            { 
                new: true, // Return the updated document
                upsert: true, // Create a new document if not found
                setDefaultsOnInsert: true // Apply default values for new documents
            }
        );

        res.status(200).json({ message: 'User updated/inserted successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating/inserting the user' });
    }
};


const generateID = async (req, res) => {

    const { hostId } = req.body;

    try {
        if (!hostId ) {
            return res.status(400).json({ error: 'hostId are required' });
        }
        const result = await HostIsOnline.find({ hostId: hostId });;

        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({msg: 'Host not found.'}); // User not found
        }
    } catch (error) {
        res.status(500).json({ error: error.message });     }
};



module.exports = {
    id_generate,
    generateID,
};
