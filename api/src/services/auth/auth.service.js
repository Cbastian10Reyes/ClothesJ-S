const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AppError = require("../../utils/app-error");

const loginAdmin = async (data) => {
  const email = data.email?.trim().toLowerCase();
  const password = data.password;

  if (!email) {
    throw new AppError(
      "Email is required",
      400,
      "ADMIN_EMAIL_REQUIRED"
    );
  }

  if (!password) {
    throw new AppError(
      "Password is required",
      400,
      "ADMIN_PASSWORD_REQUIRED"
    );
  }

  const adminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const adminPasswordHash =
    process.env.ADMIN_PASSWORD_HASH;

  const jwtSecret =
    process.env.JWT_SECRET;

  if (
    !adminEmail ||
    !adminPasswordHash ||
    !jwtSecret
  ) {
    throw new AppError(
      "Admin authentication is not configured",
      500,
      "ADMIN_AUTH_NOT_CONFIGURED"
    );
  }

  if (email !== adminEmail) {
    throw new AppError(
      "Invalid credentials",
      401,
      "INVALID_ADMIN_CREDENTIALS"
    );
  }

  const isValidPassword =
    await bcrypt.compare(
      password,
      adminPasswordHash
    );

  if (!isValidPassword) {
    throw new AppError(
      "Invalid credentials",
      401,
      "INVALID_ADMIN_CREDENTIALS"
    );
  }

  const token = jwt.sign(
    {
      role: "ADMIN",
      email: adminEmail,
    },
    jwtSecret,
    {
      expiresIn: "8h",
    }
  );

  return {
    token,
    admin: {
      email: adminEmail,
      role: "ADMIN",
    },
  };
};

module.exports = {
  loginAdmin,
};