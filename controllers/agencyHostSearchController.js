const Host = require('../models/Host');
const Agency = require('../models/Agency');

const searchhosts = async (req, res) => {
    const { agency_id, hostname } = req.body;

    // Validate inputs
    if (!hostname) {
        return res.status(400).json({ msg: 'Please provide a hostname to search' });
    }

    if (!agency_id) {
        return res.status(400).json({ msg: 'Please provide an agency_id to search within' });
    }

    try {
        // Step 1: Find the agency by the provided agency_id
        const agency = await Agency.findById(agency_id);
        if (!agency) {
            return res.status(404).json({ msg: 'Agency not found with the provided ID' });
        }

        // Step 2: Extract the host_list from the agency document
        const hostIds = agency.host_list.map(hostObj => hostObj.host_id);

        if (hostIds.length === 0) {
            return res.status(404).json({ msg: 'No hosts found in the agency\'s host_list' });
        }

        // Step 3: Search for hosts by name within the agency's host_list
        // Perform case-insensitive and partial matching with regex
        const hosts = await Host.find({
            _id: { $in: hostIds },  // Search only within the host IDs in the agency's host_list
            hostname: { $regex: hostname, $options: 'i' }  // Use regex for case-insensitive, partial matching
        });

        // Step 4: Check if any hosts were found
        if (hosts.length === 0) {
            return res.status(404).json({ msg: 'No hosts found with the provided hostname' });
        }


        return res.status(200).json(
            hosts.map(host => ({
                host_id: host._id,
                hostname: host.hostname,
                profile_url: host.profile_url || null,  // Return profile_url or null if it doesn't exist
            })));

    } catch (error) {
        // Catch and handle any errors that occur
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    searchhosts,
};
