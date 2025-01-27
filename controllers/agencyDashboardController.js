const Agency = require("../models/Agency");
const { getTodaysEarningsUtil, getTotalEarningsUtil } = require("./hostDashboardController");

const getAgencyDashboard = async (req, res) => {
  try {
    const { agency_id } = req.body;

    const agency = await Agency.findById(agency_id);

    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }

    let totalEarnings = 0;
    let todayEarnings = 0;

    for (const hostId of agency.host_list) {
      try {
        // Fetch earnings for each host
        todayEarnings += await getTodaysEarningsUtil(hostId);
        totalEarnings += await getTotalEarningsUtil(hostId);
      } catch (error) {
        console.error(`Error fetching earnings for host ${hostId}:`, error);
      }
    }

    return res.status(200).json({
      agencyname: agency.agencyname,
      todayEarning: todayEarnings,
      totalEarning: totalEarnings,
      hostList: agency.host_list,
    });
  } catch (error) {
    console.error("Error fetching agency dashboard:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the dashboard details" });
  }
};

module.exports = { getAgencyDashboard };
