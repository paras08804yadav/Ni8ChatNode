const User = require('../models/User'); 
const Host = require('../models/Host'); 

const { updateCoins } = require('../utils/updateCoins');

const startVoiceCall = async (req, res) => {
    const { user_id, host_id } = req.body;

    // Step 1: Check if required fields are present
    if (!user_id || !host_id) {
        return res.status(400).json({ msg: 'User ID and Host ID are required.' });
    }

    try {
        // Step 2: Fetch user and host data to get the current balance and voice call rate
        const user = await User.findById(user_id).select('wallet_balance');
        const host = await Host.findById(host_id).select('audio_rate'); // Fetch the host's per-minute voice call rate

        if (!user || !host) {
            return res.status(404).json({ msg: 'User or Host not found.' });
        }

        const audioRate = host.audio_rate; // Host's per-minute coin rate for voice calls

        // Step 3: Check if the user has enough coins for at least 1 minute of the voice call
        if (user.wallet_balance < audioRate) {
            return res.status(400).json({ msg: 'Insufficient balance to start the voice call.' });
        }

        // Step 4: Deduct coins for the first minute (even if call is ongoing, deduct in advance)
        const result = await updateCoins(user_id, host_id, 'voice_call');

        if (!result.success) {
            return res.status(400).json({ msg: result.message });
        }

        // Step 5: Start the voice call (Socket implementation or real-time logic can go here)
        // Placeholder for starting the call in real-time:
        console.log('Socket implementation: Voice call started.');

        // Return success message and updated balance
        res.status(200).json({
            msg: 'Voice call started successfully, coins deducted for the first minute.',
            updated_balance: result.updated_balance, // The remaining balance after first-minute deduction
        });

        // Step 6: Periodically deduct coins every minute
        let callActive = true; // A flag to control the call status

        // Use setInterval to deduct coins every 60 seconds
        const intervalId = setInterval(async () => {
            if (!callActive) {
                clearInterval(intervalId); // Clear the interval if the call is no longer active
                return;
            }

            // Fetch user's current balance before next deduction
            const updatedUser = await User.findById(user_id).select('wallet_balance');

            // Check if the user has enough coins for the next minute
            if (updatedUser.wallet_balance < audioRate) {
                // If not enough coins, disconnect the call
                console.log('Disconnecting call due to insufficient balance.');
                // Implement call disconnect logic here (e.g., emit socket event to both user and host)
                // Example: socket.emit('callEnded', { msg: 'Call ended due to insufficient coins' });
                
                callActive = false;
                clearInterval(intervalId); // Stop the interval
                return;
            }

            // If enough coins, deduct for the next minute
            const nextResult = await updateCoins(user_id, host_id, 'voice_call');

            if (!nextResult.success) {
                // Handle deduction failure
                console.log('Error deducting coins: ', nextResult.message);
                callActive = false;
                clearInterval(intervalId);
                return;
            }

            // Log or send the updated balance to the user and host
            console.log('Coins deducted for next minute. Updated balance: ', nextResult.updated_balance);

        }, 60 * 1000); // Deduct every 1 minute (60,000 ms)

    } catch (error) {
        // Handle server errors
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    startVoiceCall,
};