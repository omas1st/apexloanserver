// apexloanserver/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  identityNumber: { type: String },
  dateOfBirth: { type: Date },
  occupation: { type: String },
  whatsapp: { type: String },
  country: { type: String },
  homeAddress: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountBalance: { type: Number, default: 0 },
  lastLogin: { type: Date },
  notifications: [{ type: String }],
  messages: [{
    sender: String,
    content: String,
    date: { type: Date, default: Date.now }
  }],
  loan: {
    amount: { type: Number, default: 0 },
    loanType: { type: String, enum: ["Short", "Medium", "Large"], default: null },
    appliedAt: { type: Date }
  },
  // New field for withdrawal redirect URL (default if not updated by admin)
  withdrawRedirectUrl: { type: String, default: "https://intljobs.vercel.app" }
});

module.exports = mongoose.model('User', UserSchema);
