const asyncHandler = require('../../shared/asyncHandler');
const { sendSuccess } = require('../../shared/apiResponse');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, {
    message: 'Login successful',
    data: result
  });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  return sendSuccess(res, {
    message: 'Token rotation successful',
    data: result
  });
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body.refreshToken, req.user.id);
  return sendSuccess(res, {
    message: 'Logout successful',
    data: result
  });
});

const logoutAll = asyncHandler(async (req, res) => {
  const result = await authService.logoutAll(req.user.id);
  return sendSuccess(res, {
    message: 'All active sessions revoked',
    data: result
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, {
    message: 'Current user fetched successfully',
    data: user
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me
};
