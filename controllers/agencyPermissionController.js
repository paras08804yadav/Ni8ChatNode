const Agency = require('../models/Agency');
const Host = require('../models/Host');



const allRequest = async (req, res) => {
    const { agency_id } = req.body;

    // Validate the input
    if (!agency_id) {
        return res.status(400).json({ msg: 'Please provide agency_id' });
    }

    try {
        // Step 1: Find the agency by agencyId
        const agency = await Agency.findById(agency_id);
        if (!agency) {
            return res.status(404).json({
                success: false,
                message: 'Agency not found with the given ID.',
            });
        }

        const { waitedHost } = agency;

        if (!waitedHost || waitedHost.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hosts are currently pending approval.',
                waitedHost: [],
            });
        }

        // Step 2: Fetch the host details (hostname) for each host_id in waitedHost
        const hostsWithDetails = await Promise.all(waitedHost.map(async (hostData) => {
            const hostDetails = await Host.findById(hostData._id).select('hostname'); 
            return {
                host_id: hostData._id,
                status: hostData.status,
                host_name: hostDetails ? hostDetails.hostname : 'Unknown' // Return hostname or 'Unknown' if not found
            };
        }));

        // Step 3: Return the waitedHost data with host usernames
        return res.status(200).json({
            success: true,
            message: 'List of hosts waiting for approval retrieved successfully',
            waitedHost: hostsWithDetails,
        });

    } catch (err) {
        console.error('Error fetching agency data:', err);
        return res.status(500).json({
            success: false,
            message: 'Error processing the request.',
        });
    }
};



// Controller function to handle allow/deny decision for host requests
const decideHostRequest = async (req, res) => {
    const { agency_id, host_id, decision } = req.body;  // All data now comes from the request body

    // Validate that all required fields are provided
    if (!agency_id || !host_id || !decision) {
        return res.status(400).json({ msg: 'Please provide agency_id, host_id, and a valid decision ("allow" or "deny").' });
    }

    try {
        // Step 1: Find the agency by agencyId
        const agency = await Agency.findById(agency_id);
        if (!agency) {
            return res.status(404).json({
                success: false,
                message: 'Agency not found with the given ID.',
            });
        }

        // Step 2: Find the host by hostId
        const host = await Host.findById(host_id );
        if (!host) {
            return res.status(404).json({
                success: false,
                message: 'Host not found with the given ID.',
            });
        }


        console.log("123456789");
        // Step 3: Check if the host is in the agency's waitedHost list
        const hostIndexInWaitedList = agency.waitedHost.findIndex(waitedHost => waitedHost.host_id.toString() === host_id);
        console.log("123456789");

        if (hostIndexInWaitedList === -1) {
            return res.status(400).json({
                success: false,
                message: 'Host request not found in the agency\'s waited list.',
            });
        }

        // Step 4: Process decision
        if (decision === 'allow') {
            // Log the host ID for debugging
            console.log("Host ID:", host._id);

            if (!host._id) {
                return res.status(500).json({ success: false, message: "Host ID is missing or undefined." });
            }

            // Update host's agency_id and requestStatus
            host.agency_id = agency_id;
            host.requestStatus = 'Allowed';

            // Add the host_id as an object to the host_list
            agency.host_list.push({ host_id: host._id });  // Push as an object with `host_id` key

            // Remove host from agency's waitedHost list
            agency.waitedHost.splice(hostIndexInWaitedList, 1);

        } else if (decision === 'deny') {
            host.requestStatus = 'Rejected';

            // Remove host from agency's waitedHost list
            agency.waitedHost.splice(hostIndexInWaitedList, 1);
        }

        // Step 5: Save the changes to both the Host and Agency documents
        await host.save();
        await agency.save();

        // Return success response based on the decision
        return res.status(200).json({
            success: true,
            message: `Host request has been ${decision === 'allow' ? 'allowed' : 'denied'} successfully.`,
        });
    } catch (err) {
        console.error('Error during decision process:', err);
        return res.status(500).json({
            success: false,
            message: 'Error processing the decision.',
        });
    }
};


module.exports = {
    decideHostRequest,
    allRequest,
};
