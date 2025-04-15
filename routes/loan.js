// apexloanserver/routes/loan.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendNotification } = require('../utils/emailNotifier');

router.post('/apply', async (req, res) => {
  try {
    const { userId, loanType, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Set appliedAt timestamp along with loan details
    user.loan = { loanType, amount, appliedAt: new Date() };
    user.accountBalance = amount;
    await user.save();
    // Notify admin of loan application
    sendNotification("Loan Application", `User Applied for a Loan:
Name: ${user.fullName}
Email: ${user.email}
Loan Type: ${loanType}
Amount: ${amount}`);
    res.json({ message: "Loan successfully approved, kindly go to your dashboard to withdraw to your bank account", accountBalance: user.accountBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cancel', async (req, res) => {
  try {
    const { userId, adminCancel } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    // If adminCancel flag is true, cancel regardless of the 15-minute window.
    if (adminCancel) {
      user.loan = { amount: 0, loanType: null, appliedAt: null };
      user.accountBalance = 0;
      await user.save();
      return res.json({ message: "User's loan has been cancelled successfully" });
    }
    if (user.loan && user.loan.appliedAt) {
      const appliedAt = new Date(user.loan.appliedAt);
      const now = new Date();
      const diffMinutes = (now - appliedAt) / 60000;
      if (diffMinutes <= 15) {
        user.loan = { amount: 0, loanType: null, appliedAt: null };
        user.accountBalance = 0;
        await user.save();
        return res.json({ message: "Loan has been successfully cancelled" });
      } else {
        return res.json({ message: "Loan cancellation request received. Loan remains active as it was applied over 15 minutes ago. Please contact admin for further modifications." });
      }
    } else {
      return res.status(400).json({ message: "No active loan found." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
