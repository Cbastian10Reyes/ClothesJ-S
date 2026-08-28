const AppError = require("../utils/app-error");

const notFoundMiddleware = (req, _res, next) => {
  return next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      "ROUTE_NOT_FOUND"
    )
  );
};

module.exports = notFoundMiddleware;