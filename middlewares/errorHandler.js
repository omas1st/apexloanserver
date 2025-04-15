// apexloanserver/middlewares/errorHandler.js
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  };
  