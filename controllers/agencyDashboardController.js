const Agency = require('../models/Agency'); // Update the path to your Agency model

const getAgencyDashboard = async (req, res) => {
  try {
    const { agency_id } = req.body; // Extract agency_id from the request body

    // Find the agency by ID
    const agency = await Agency.findById(agency_id);

    // If no agency is found, return a 404 status with an error message
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    // Return the dashboard details with a 200 status
    return res.status(200).json({
      agencyname: agency.agencyname,
      todayEarning: 0, // Hardcoded for now
      totalEarning: 0, // Hardcoded for now
      hostList: agency.host_list, // Host list from the agency document
    });
  } catch (error) {
    console.error('Error fetching agency dashboard:', error);

    // Return a 500 status with a general error message
    return res.status(500).json({ error: 'An error occurred while fetching the dashboard details' });
  }
};

module.exports =
{ 
    getAgencyDashboard 
};
