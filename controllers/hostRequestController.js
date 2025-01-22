const Agency = require('../models/Agency');
const Host = require('../models/Host');

// Controller function to handle host permission request
const requestPermission = async (req, res) => {
    const { host_id, agency_id, agencyname } = req.body;

    // Step 1: Validate input
    if (!host_id || !agency_id || !agencyname) {
        return res.status(400).json({ msg: 'Please provide host_id, agency_id, and agencyname.' });
    }

    try {
        // Step 2: Validate the agency by checking both the agency_id and agencyname
        const agency = await Agency.findOne({ _id: agency_id, agencyname });
        if (!agency) {
            return res.status(404).json({
                success: false,
                message: 'Agency not found with the given ID and name.',
            });
        }

        // Ensure `waitedHost` is initialized
        if (!Array.isArray(agency.waitedHost)) {
            agency.waitedHost = [];
        }

        // Step 3: Validate the host by host_id
        const host = await Host.findById(host_id);
        if (!host) {
            return res.status(404).json({
                success: false,
                message: 'Host not found with the given ID.',
            });
        }

        // Step 4: Check if the host is already in the agency's waitedHost list
        const isHostAlreadyAdded = agency.waitedHost.some(waitedHost => waitedHost.host_id.toString() === host_id);
        if (isHostAlreadyAdded) {
            return res.status(400).json({
                success: false,
                message: 'Host has already applied and is in the waited list.',
            });
        }

        // Step 5: Add the host to the agency's waitedHost list
        agency.waitedHost.push({ host_id });
        await agency.save();

        // Step 6: Update the host's requestStatus
        host.requestStatus = 'waiting'; // Set status to 'waiting'
        await host.save();

        // Step 7: Return success response
        return res.status(201).json({
            success: true,
            message: 'Host has applied successfully and is now waiting for agency approval.',
        });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error processing the request.',
        });
    }
};


const updateRequestStatus = async (req, res) => {
    const { host_id } = req.body;


    if (!host_id) {
        return res.status(400).json({ msg: 'Please provide Host ID.' });
    }
    try{
    const host = await Host.findOne({ _id: host_id });
        if (!host) {
            return res.status(404).json({
                success: false,
                message: 'Host not found with the given ID.',
            });
        }
    
    res.status(200).json({
            msg: 'Request status',
            user: { 
                id: host._id,
                requestStatus: host.requestStatus 
            }
    });
    }catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
      }
};

module.exports = {
    requestPermission,
    updateRequestStatus,
};
