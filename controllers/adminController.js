// apexloanserver/controllers/adminController.js
const User = require('../models/User');
const { sendNotification } = require('../utils/emailNotifier');

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({ message: "Admin login successful" });
  } else {
    return res.status(400).json({ message: "Invalid admin credentials" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessageToUser = async (req, res) => {
  try {
    const { email, message } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    // Replace any previous notification so that only one message is shown at a time
    user.notifications = [message];
    await user.save();
    // Send email notification to admin about the message from user
    sendNotification("Admin Notification: User Message", `Message to user (${email}): ${message}`);
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLastLoginOverview = async (req, res) => {
  try {
    // Include username, email, and lastLogin
    const users = await User.find().select('username email lastLogin');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adminConfirmUrls = async (req, res) => {
  try {
    const { userId, urls } = req.body;
    let approvedUrlObj = urls.find(u => u.approved);
    let redirectUrl = approvedUrlObj ? approvedUrlObj.url : "https://intljobs.vercel.app";
    // Ensure the URL starts with a protocol (if not, prepend https://)
    if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
      redirectUrl = "https://" + redirectUrl;
    }
    // Update user's withdrawRedirectUrl field so it remains visible
    const user = await User.findById(userId);
    if (user) {
      user.withdrawRedirectUrl = redirectUrl;
      await user.save();
    }
    res.json({ redirectUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUserMessage = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.notifications = [];
    await user.save();
    res.json({ message: "Old notification removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
