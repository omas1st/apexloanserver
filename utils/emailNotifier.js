// apexloanserver/utils/emailNotifier.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL, // e.g., your admin Gmail address
    pass: process.env.ADMIN_EMAIL_PASSWORD // your Gmail password or app password
  }
});

exports.sendNotification = async (subject, text) => {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL, // send to admin
    subject: subject,
    text: text
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Notification email sent.");
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
};
