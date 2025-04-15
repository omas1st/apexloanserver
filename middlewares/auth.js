// apexloanserver/middlewares/auth.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token)
    return res.status(401).json({ message: "No token provided." });

  jwt.verify(token, process.env.secret_key, (err, decoded) => {
    if (err) return res.status(500).json({ message: "Failed to authenticate token." });
    req.userId = decoded.id;
    next();
  });
};
