const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware3');
const { signup, login} = require('../controllers/hostController');
const { getFeed } = require('../controllers/agencyFeedController');
const { decideHostRequest, allRequest } = require('../controllers/agencyPermissionController');
const { submitKyc, handleKycUpload} = require('../controllers/agencyKycController');
const { searchhosts } = require('../controllers/agencyHostSearchController');

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.post('/search',authenticateToken, searchhosts);
router.post('/feed',authenticateToken, getFeed);
router.post('/requestList',authenticateToken,allRequest)
router.post('/permission',authenticateToken, decideHostRequest)
router.post('/submitKyc', handleKycUpload, submitKyc);


module.exports = router;