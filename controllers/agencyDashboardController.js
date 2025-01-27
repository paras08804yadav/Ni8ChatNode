const Agency = require("../models/Agency");
const Host = require("../models/Host");

const { getTodaysEarningsUtil, getTotalEarningsUtil } = require("../utils/earningsHost");

const getAgencyDashboard = async (req, res) => {
  try {
    const { agency_id } = req.body;

    const agency = await Agency.findById(agency_id);

    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }

    let totalEarnings = 0;
    let todayEarnings = 0;
    const hostInfo = [];


    for (const hostId of agency.host_list) {
      try {
        const host = await Host.findById(hostId); 

        if (!host) {
          console.error(`Host not found for ID: ${hostId}`);
          continue;
        }

        const todayEarning = await getTodaysEarningsUtil(hostId);
        const totalEarning = await getTotalEarningsUtil(hostId);

        totalEarnings += totalEarning;
        todayEarnings += todayEarning;
        hostInfo.push({
          hostname: host.hostname,
          todayEarning,
          totalEarning,
        });
      } catch (error) {
        console.error(`Error fetching earnings for host ${hostId}:`, error);
      }
    }

    return res.status(200).json({
      agencyname: agency.agencyname,
      todayEarning: todayEarnings,
      totalEarning: totalEarnings,
      hostInfo,
    });
  } catch (error) {
    console.error("Error fetching agency dashboard:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the dashboard details" });
  }
};

module.exports = { getAgencyDashboard };
