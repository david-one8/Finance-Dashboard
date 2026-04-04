const asyncHandler = require('../../shared/asyncHandler');
const { sendSuccess } = require('../../shared/apiResponse');
const userService = require('./user.service');

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'User created successfully',
    data: user
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return sendSuccess(res, {
    message: 'Users fetched successfully',
    data: result.items,
    meta: result.meta
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, {
    message: 'User fetched successfully',
    data: user
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return sendSuccess(res, {
    message: 'User updated successfully',
    data: user
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(req.params.id, req.body.status);
  return sendSuccess(res, {
    message: 'User status updated successfully',
    data: user
  });
});

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  updateUserStatus
};