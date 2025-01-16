const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware2');
const { signup, updateHostInfo, updateHostPreferences, getUserDetails, login} = require('../controllers/hostController');
const {getFeed} = require('../controllers/hostFeedController');
const {searchUsers} = require('../controllers/hostSearchController');
const {requestPermission, updateRequestStatus} = require('../controllers/hostRequestController');
const { uploadMedia, image, video } = require('../controllers/hostPostController');
const { getHostTransactionHistory } = require('../controllers/hostTransactionHistoryController');
const {account, accountEdit , forgetPassword} =  require('../controllers/hostAccountController');
// const { sendMessage, setupSocketIo} = require('../controllers/chatUserController');
const { getWalletBalance } = require('../controllers/hostWalletController');
const { searchUserByName } = require('../controllers/hostChatSearchController');
const {handleKycUpload, submitKyc} = require('../controllers/hostKycController');
const {updateDeviceToken} = require('../controllers/hostUpdateDeviceToken')
const { getTodaysEarnings, getTotalEarnings } = require('../controllers/hostDashboardController');
const {id_generate, generateID} = require('../controllers/hostGenerateID');
const {getHostMessages} = require('../controllers/hostInboxController');
const {getAllMessagesBetweenUserAndHost} = require('../controllers/hostInboxController');
const {updateCoins}= require('../utils/updateCoins');
const { deleteAccount } = require('../controllers/hostDeletedAccountController')


const { bankAccountVerification } = require('../controllers/hostBankAccountController');
const { fetchHostNotifications } = require('../controllers/hostNotificationController');

const router = express.Router();

// , accountEdit, forgetPassword
router.post('/signup', signup);
router.post('/signup/Info', authenticateToken, updateHostInfo);
router.post('/signup/info/preference', authenticateToken, updateHostPreferences);



router.post('/login', login);


router.get('/search', authenticateToken,searchUsers);

router.post('/post', authenticateToken, uploadMedia);
router.post('/image', authenticateToken, image);
router.post('/video', authenticateToken, video);


router.post('/feed', authenticateToken, getFeed);



// Device Tokens
router.post('/HostDeviceToken', authenticateToken, updateDeviceToken)

// inbox 
// router.post('/send',  authenticateToken, sendMessage,updateCoins)
router.post('/inbox',  authenticateToken, getHostMessages);
router.post('/inbox/message', getAllMessagesBetweenUserAndHost);

router.post('/getUserDetails', authenticateToken, getUserDetails);
router.post('/search', authenticateToken,  searchUserByName);

//Request 
router.post('/request',authenticateToken, requestPermission);
router.post('/requestStatus', authenticateToken, updateRequestStatus);

//getTransactionsByDate 
router.post('/transactions', authenticateToken, getHostTransactionHistory);

//  VCall
router.post('/IdGenerate', authenticateToken, id_generate);
router.post('/getId', generateID);

// Dashboard
// router.get('/dashboard', getHostEarningsDashboard);
router.post('/todayEarnings',authenticateToken,getTodaysEarnings);
router.post('/totalEarnings',authenticateToken, getTotalEarnings);

// Account
router.post('/account',  account);
router.post('/account/edit', accountEdit);
router.post('/forgetPassword',authenticateToken,forgetPassword);

// Kyc
// Example usage in a route
router.post('/submitKyc', authenticateToken,handleKycUpload, submitKyc);
router.post('/notification', fetchHostNotifications);


// Bank Account
router.post('/accountVerification', authenticateToken,bankAccountVerification);

//Wallet
router.post('/walletBalance', authenticateToken,getWalletBalance);

// delete
router.post('/delete', authenticateToken, deleteAccount);

module.exports = router;
