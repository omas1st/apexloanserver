// apexloanserver/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendNotification } = require('../utils/emailNotifier');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, identityNumber, dateOfBirth, occupation, whatsapp, country, homeAddress, username, password } = req.body;
    const lowerUsername = username.toLowerCase();
    if (await User.findOne({ username: lowerUsername })) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      identityNumber,
      dateOfBirth,
      occupation,
      whatsapp,
      country,
      homeAddress,
      username: lowerUsername,
      password: hashedPassword
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.secret_key, { expiresIn: '1d' });
    sendNotification("Apex Loan: New Registration", `User Registered:\nName: ${fullName}\nEmail: ${email}\nUsername: ${lowerUsername}`);
    // Return both token and the newly created user data
    res.status(201).json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id }, process.env.secret_key, { expiresIn: '1d' });
      user.lastLogin = Date.now();
      await user.save();
      sendNotification("Apex Loan: User Login", `User Logged In:\nName: ${user.fullName}\nEmail: ${user.email}\nUsername: ${user.username}`);
      return res.json({ token, user });
    }
    res.status(400).json({ message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
