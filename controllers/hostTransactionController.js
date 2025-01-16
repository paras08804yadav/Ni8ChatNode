const HostTransaction = require('../models/hostTransaction');

const Host = require('../models/Host'); 

const hostTransaction = async (req, res) => {
    const { host_id, user_id, transaction_type, message_count, duration } = req.body;

    // Validate required fields
    if (!host_id || !user_id || !transaction_type) {
        return res.status(404).json({ message: 'Enter host_id, user_id, transaction_type' });
    }

    if (transaction_type === 'message' && (!message_count || message_count <= 0)) {
        return res.status(404).json({ message: 'Enter valid message_count for message transaction' });
    }

    if ((transaction_type === 'video_call' || transaction_type === 'voice_call') && (!duration || duration <= 0)) {
        return res.status(404).json({ message: 'Enter valid duration for video/voice call transaction' });
    }

    try {
        // Fetch host's rate details
        const host = await Host.findById(host_id);
        if (!host) {
            return res.status(404).json({ message: 'Host not found' });
        }

        const { chat_rate, audio_rate, video_rate } = host;

        // Calculate total earned coins based on transaction type and host rates
        let total_earned_coins = 0;

        if (transaction_type === 'message') {
            total_earned_coins = message_count * (chat_rate || 0);
        } else if (transaction_type === 'voice_call') {
            total_earned_coins = duration * (audio_rate || 0);
        } else if (transaction_type === 'video_call') {
            total_earned_coins = duration * (video_rate || 0);
        }

        // Create new transaction document
        const newTransaction = new HostTransaction({
            host_id,
            user_id,
            transaction_type,
            message_count: message_count || 0,
            duration: duration || 0,
            total_earned_coins
        });

        // Save to database
        await newTransaction.save();

        // Send success response
        return res.status(200).json({
            message: 'Transaction saved successfully',
            data: newTransaction
        });
    } catch (error) {
        console.error('Error saving transaction:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};

module.exports = {  hostTransaction };


