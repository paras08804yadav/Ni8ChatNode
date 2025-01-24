const mongoose = require('mongoose');
const Host = require('../models/Host');
const Agency = require('../models/Agency');
const { calculateAge } = require('../utils/calculateAge');


const getFeed = async (req, res) => {
    const { agency_id } = req.body;

    if (!agency_id) {
        return res.status(400).json({ message: 'Agency ID is required' });
    }

    try {
        const agency = await Agency.findById(agency_id);
        if (!agency) {
            return res.status(404).json({ message: 'Agency not found' });
        }
        console.log(agency.host_list);        
        // Step 2: Extract the host_list from the agency document
        const hostIds = agency.host_list.map(hostId => {
            // Convert string IDs to ObjectId if necessary
            return mongoose.Types.ObjectId.isValid(hostId) ? new mongoose.Types.ObjectId(hostId) : hostId;
        });

        if (hostIds.length === 0) {
            return res.status(404).json({ message: 'No hosts found in this agency\'s host_list' });
        }

        // Step 3: Retrieve the hosts using the host IDs from the host_list
        const hosts = await Host.find({ _id: { $in: hostIds } });

        // Step 4: Check if any hosts were found
        if (hosts.length === 0) {
            return res.status(404).json({ message: 'No hosts found for the given agency' });
        }

        // Step 5: Return the found hosts
        return res.status(200).json(
            hosts.map(host => ({
                host_id: host._id,
                interest: host.interest, 
                hostname: host.hostname,
                profile_url: `${req.protocol}://${req.get('host')}/host.profile_url`,
                age: calculateAge(host.Date_of_Birth),}))
        );
    } catch (error) {
        console.error('Error fetching hosts:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getFeed,
};
