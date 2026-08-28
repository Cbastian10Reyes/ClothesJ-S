const errorMiddleware = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  const code = error.code || "INTERNAL_SERVER_ERROR";

  const message =
    error.isOperational
      ? error.message
      : "An unexpected error occurred";

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    code,
    message,
  });
};

module.exports = errorMiddleware;