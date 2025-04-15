// apexloanserver/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.adminLogin);
router.get('/users', adminController.getAllUsers);
router.post('/message', adminController.sendMessageToUser);
router.get('/last-login', adminController.getLastLoginOverview);
router.post('/confirm-url', adminController.adminConfirmUrls);
// New: Endpoint for deleting a user's message
router.post('/delete-message', adminController.deleteUserMessage);

module.exports = router;
