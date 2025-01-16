const HostIsOnline = require('../models/host_isOnline'); 
const UserIsOnline = require('../models/user_isOnline'); 


const id_generate = async (req, res) => {

    const { hostId, host_generatedID } = req.body;

    if (!hostId || !host_generatedID) {
        return res.status(400).json({ error: 'hostname and host_generatedID are required' });
    }

    try {
        // Find the user by username and update if exists, else create a new document
        const host = await HostIsOnline.findOneAndUpdate(
            { hostId }, // Query to find the user
            {
                host_generatedID, // Update the ID
                timestamp: Date.now() // Update the timestamp
            },
            { 
                new: true, // Return the updated document
                upsert: true, // Create a new document if not found
                setDefaultsOnInsert: true // Apply default values for new documents
            }
        );

        res.status(200).json({ message: 'Host updated/inserted successfully', host });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating/inserting the host' });
    }
};


const generateID = async (req, res) => {

    const { userId } = req.body;

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userID are required' });
        }
        const result = await UserIsOnline.find({ userId: userId });;

        
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({msg: 'user not found.'});
        }
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle server errors
    }
};

module.exports = {
    id_generate,
    generateID,
};
