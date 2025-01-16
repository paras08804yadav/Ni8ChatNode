const Host = require('../models/Host');

const filterHosts = async (req, res) => {
    try {
        const { filter, gender, language } = req.body; 

        const query = {};

        if (gender) {
            query.gender = gender; 
        }

        if (language) {
            query.languages = { $in: language.split(',').map(lang => lang.trim()) };
        }

        let sortOptions = {};
        if (filter) {
            switch (filter.toLowerCase()) {
                case 'rank_asc':
                    sortOptions.rank = 1; 
                    break;
                case 'rank_desc':
                    sortOptions.rank = -1; 
                    break;
                case 'rating_asc':
                    sortOptions.rating = 1;
                    break;
                case 'rating_desc':
                    sortOptions.rating = -1;
                    break;
                default:
                    sortOptions = {};
                    break;
            }
        }

        const hosts = await Host.find(query)
            .select(`
                hostname gender location country Date_of_Birth LookingFor 
                languages interest bio social_id profile_url rank 
                audio_rate video_rate chat_rate rating followers
            `)
            .sort(sortOptions); 

        if (hosts.length === 0) {
            return res.status(404).json({ message: 'No hosts found matching your criteria' });
        }

        res.json({
        hosts:hosts.map(host => ({
        _id: host._id,
        hostname: host.hostname,
        gender: host.gender,
        location: host.location,
        country: host.country,
        Date_of_Birth: host.Date_of_Birth,
        LookingFor: host.LookingFor,
        languages: host.languages,
        interest: host.interest,
        bio: host.bio,
        social_id: host.social_id,
        profile_url: `${req.protocol}://${req.get('host')}/uploads/profile_photo/${host._id}.jpg`,
        rank: host.rank,
        audio_rate: host.audio_rate,
        video_rate: host.video_rate,
        chat_rate: host.chat_rate,
        rating: host.rating,
        followers: host.followers,
    })),
    });
       
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hosts', error: error.message });
    }
};

module.exports = {
    filterHosts,
};
