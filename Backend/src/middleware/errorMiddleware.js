// src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;

