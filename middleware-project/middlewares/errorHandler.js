// middlewares/errorHandler.js
const { logger } = require('./logger');

module.exports = (err, req, res, next) => {
  // Safe logging (if logger attached)
  if (req && req.log) {
    req.log.error({
      message: err.message,
      stack: err.stack,
      status: err.status || 500
    });
  } else {
    console.error('Unhandled error:', err);
  }

  const status = err.status || 500;
  const type = err.type || (status >= 500 ? 'internal_error' : 'bad_request');

  // Friendly message — do not leak sensitive info
  const message = status >= 500 ? 'Internal server error' : err.message;

  res.status(status).json({
    error: type,
    message,
    requestId: req && req.requestId
  });
};
