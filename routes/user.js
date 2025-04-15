// apexloanserver/routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendNotification } = require('../utils/emailNotifier');

// Get user by ID (protected route)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User (for admin edit functionality)
router.put('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete User (for admin delete functionality)
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New: Search user by email (for admin confirmation and user details)
router.get('/by-email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Updated: Send message from user dashboard – now calls email notifier
router.post('/message', async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message content is required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.username || user.username.trim() === "") {
      return res.status(400).json({ message: "Username must be set before sending a message" });
    }
    user.messages.push({ sender: user.username, content: message, date: new Date() });
    await user.save();
    // Send notification to admin via Gmail
    sendNotification("User Message", `User ${user.fullName} (${user.email}) sent: ${message}`);
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
