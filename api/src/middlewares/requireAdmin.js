const jwt = require("jsonwebtoken");

const AppError = require("../utils/app-error");

const requireAdmin = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        "Authorization token is required",
        401,
        "AUTH_TOKEN_REQUIRED"
      );
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      throw new AppError(
        "Invalid authorization token",
        401,
        "INVALID_AUTH_TOKEN"
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      throw new AppError(
        "Invalid or expired token",
        401,
        "INVALID_AUTH_TOKEN"
      );
    }

    if (decoded.role !== "ADMIN") {
      throw new AppError(
        "Administrator access required",
        403,
        "ADMIN_ACCESS_REQUIRED"
      );
    }

    req.admin = {
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireAdmin;