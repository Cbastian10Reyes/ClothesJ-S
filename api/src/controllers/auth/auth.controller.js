const authService = require("../../services/auth/auth.service");

const loginAdmin = async (req, res, next) => {
  try {
    const result =
      await authService.loginAdmin(req.body);

    return res.status(200).json({
      success: true,
      code: "ADMIN_LOGIN_SUCCESS",
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  loginAdmin,
};