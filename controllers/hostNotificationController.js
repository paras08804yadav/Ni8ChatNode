const HostNotification = require('../models/hostNotification');
const { calculateTimeAgo } = require('../utils/calculateAge');

const fetchHostNotifications = async (req,res) => {    try {
        const { host_id } = req.body;
        const notifications = await HostNotification.find({ host_id })
            .sort({ timestamp: -1 })
            .select('-__v')
            .lean();

        if (!notifications.length) {
            return res.status(404).json({ success: false, message: 'No host notifications found' });
        }

        // Format the response with descriptive details and time ago
        const response = notifications.map(notification => ({
            title: notification.title,
            description: notification.description,
            photo:  `${req.protocol}://${req.get('host')}/${notification.photo}`,
            notificationAgo: calculateTimeAgo(notification.timestamp),  
        }));

        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching user notifications', error: error.message });
    }
};

module.exports ={
   fetchHostNotifications, 
};