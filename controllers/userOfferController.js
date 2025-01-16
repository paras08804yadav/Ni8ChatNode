// userController.js
const getAllOffers = (req, res) => {
    const offers = [
        { offer_name: 'Silver Pack', amount: 500, coins: 100 },
        { offer_name: 'Gold Pack', amount: 1000, coins: 250 },
        { offer_name: 'Platinum Pack', amount: 2000, coins: 400 },
        { offer_name: 'Diamond Pack', amount: 3000, coins: 600 },
        { offer_name: 'Ruby Pack', amount: 4000, coins: 800 },
        { offer_name: 'Emerald Pack', amount: 5000, coins: 500 },
        { offer_name: 'Sapphire Pack', amount: 7000, coins: 700 },
        { offer_name: 'Amethyst Pack', amount: 8000, coins: 900 },
        { offer_name: 'Ultimate Pack', amount: 10000, coins: 1200 },
    ];

    // Send the offers in the response
    res.status(200).json({
        msg: 'Offers retrieved successfully',
        offers: offers,
    });
};

// Function to get a specific offer by its name
const getOfferByName = (req, res) => {
    const { offer_name } = req.params;

    const offers = [
        { offer_name: 'Silver Pack', amount: 500, coins: 100 },
        { offer_name: 'Gold Pack', amount: 1000, coins: 250 },
        { offer_name: 'Platinum Pack', amount: 2000, coins: 400 },
        { offer_name: 'Diamond Pack', amount: 3000, coins: 600 },
        { offer_name: 'Ruby Pack', amount: 4000, coins: 800 },
        { offer_name: 'Emerald Pack', amount: 5000, coins: 500 },
        { offer_name: 'Sapphire Pack', amount: 7000, coins: 700 },
        { offer_name: 'Amethyst Pack', amount: 8000, coins: 900 },
        { offer_name: 'Ultimate Pack', amount: 10000, coins: 1200 },
    ];

    // Find the offer by its name
    const offer = offers.find(o => o.offer_name === offer_name);

    if (!offer) {
        return res.status(404).json({ msg: 'Offer not found' });
    }

    // Send the selected offer's details in the response
    res.status(200).json({
        msg: 'Offer retrieved successfully',
        offer: offer,
    });
};

// Export the functions to use in the routes
module.exports = {
    getAllOffers,
    getOfferByName,
    // other controller functions...
};
