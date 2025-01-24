const Agency = require('../models/Agency'); // Update the path to your Agency model
const {getTodaysEarnings, getTotalEarnings} = require('./hostDashboardController');

const getAgencyDashboard = async (req, res) => {
  try {
    const { agency_id } = req.body; // Extract agency_id from the request body

    // Find the agency by ID
    const agency = await Agency.findById(agency_id);

    // If no agency is found, return a 404 status with an error message
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    let totalEarnings = 0;
    let todayEarnings = 0;


    // for (const host of agency.host_list) {
    //     const hostId = host._id;
  
    //     // Fetch today's earnings for the host
    //     const todayEarningResponse = await getTodaysEarnings({
    //       body: { host_id: hostId },
    //     });
    //     if (!todayEarningResponse.error) {
    //       todayEarnings += todayEarningResponse.todayEarnings || 0;
    //     }
  
    //     // Fetch total earnings for the host
    //     const totalEarningResponse = await getTotalEarnings({
    //       body: { host_id: hostId },
    //     });
    //     if (!totalEarningResponse.error) {
    //       totalEarnings += totalEarningResponse.totalEarnings || 0;
    //     }
    // }
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
