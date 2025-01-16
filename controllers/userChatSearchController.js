const Host = require('../models/Host');




const searchHostByName = async (req, res) => {
    const { hostname } = req.body; 


    if (!hostname) {
        return res.status(400).json({ msg: 'Please provide a hostname to search' });
    }

    try {
        const hosts = await Host.find(
            { hostname: { $regex: hostname, $options: 'i' } },
            'host_id hostname profile_url' 
        );


        if (hosts.length === 0) {
            return res.status(404).json({ msg: 'No hosts found with the provided hostname' });
        }


        return res.status(200).json({
            msg: 'Hosts retrieved successfully',
            hosts: hosts,
        });

    } catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};


module.exports = {
    searchHostByName,
};
