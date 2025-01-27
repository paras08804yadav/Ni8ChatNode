const Host = require('../models/Host');
const Agency = require('../models/Agency');
const mongoose = require('mongoose');

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
        const hostIds = agency.host_list.map(hostObj => new mongoose.Types.ObjectId(hostObj.host_id));
        console.log(hostIds);

        if (hostIds.length === 0) {
            return res.status(404).json({ msg: 'No hosts found in the agency\'s host_list' });
        }


        const hosts = await Host.find({
            _id: { $in: hostIds },  
            hostname: { $regex: hostname, $options: 'i' }  
        });

        if (hosts.length === 0) {
            return res.status(404).json({ msg: 'No hosts found with the provided hostname' });
        }


        return res.status(200).json(
            hosts.map(host => ({
                host_id: host._id,
                hostname: host.hostname,
                profile_url: host.profile_url || null, 
            })));

    } catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    searchhosts,
};
