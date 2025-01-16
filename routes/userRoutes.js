const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const { signup, updateUserInfo, updateUserPreferences, login} = require('../controllers/userController');
const { getHostDetails, fetchUserImages, fetchUserVideos} = require('../controllers/userHostPostController');
const {searchHosts}= require('../controllers/userSearchController');
const { filterHosts}= require('../controllers/userFilterHostController');
const { getFeed} = require('../controllers/userFeedControler');
const { account, accountEdit, forgetPassword } = require('../controllers/userAccountController');
const { getWalletBalance } = require('../controllers/userWalletController');
const { fetchTransactionHistory } = require('../controllers/userTransactionHistorycontroller')
const { getAllOffers, getOfferByName } = require('../controllers/userOfferController');
const { searchHostByName} = require('../controllers/userChatSearchController');
const { fetchSpendingHistory} = require('../controllers/userSpendingHistoryController')
const { followHost, unfollowHost } = require('../controllers/userFollowController');
const { getUserMessages, getAllMessagesBetweenUserAndHost} = require('../controllers/userInboxController');
const {id_generate, generateID} = require('../controllers/UserGenerateID')
const {updateDeviceToken} = require('../controllers/userUpdateDeviceToken')
const {updateCoins}= require('../utils/updateCoins')


const { fetchUserNotifications }  = require('../controllers/userNotificationController');
const { deleteAccount } = require('../controllers/userDeletedAccountController');

const router = express.Router();




// Route for registration
router.post('/signup', signup);
router.post('/signup/info', authenticateToken, updateUserInfo);
router.post('/signup/info/preference', authenticateToken, updateUserPreferences);

// Route for login
router.post('/login', login);



//Route for feed
router.post('/feed', authenticateToken, getFeed);

router.get('/offers', authenticateToken, getAllOffers);
router.get('/offers/:offer_name', authenticateToken, getOfferByName);

//search with filter
router.get('/search', authenticateToken, searchHosts);

router.post('/filter', authenticateToken, filterHosts );

//get user details.
router.post('/getHostDetails',  getHostDetails)
router.post('/hostImage', authenticateToken, fetchUserImages)
router.post('/hostVideo', authenticateToken, fetchUserVideos)


// inbox 
router.post('/inbox', authenticateToken, getUserMessages);
router.post('/inbox/message',getAllMessagesBetweenUserAndHost);
router.post('/inbox/search', authenticateToken, searchHostByName);


// GenerateID for VCall
router.post('/IdGenerate', authenticateToken, id_generate);
router.post('/getId', authenticateToken, generateID);


//transaction history
router.post('/transactionHistory', authenticateToken, fetchTransactionHistory);
router.post('/spendingHistory', authenticateToken, fetchSpendingHistory);


// Follow and unfollow
router.post('/follow', authenticateToken, followHost);
router.post('/unfollow', authenticateToken, unfollowHost);

// Account
router.post('/account', authenticateToken, account);
router.post('/account/Edit', authenticateToken, accountEdit);

//Wallet
router.post('/walletBalance', authenticateToken, getWalletBalance);


// Device Tokens
router.post('/UserDeviceToken', authenticateToken, updateDeviceToken);


// notification
router.post('/notification', authenticateToken, fetchUserNotifications);


//forget password
router.post('/forgetPassword', authenticateToken, forgetPassword);

// delete account
router.post('/deleteAccount', authenticateToken, deleteAccount)


module.exports = router;