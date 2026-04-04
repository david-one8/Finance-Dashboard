const { Prisma } = require('@prisma/client');
const ApiError = require('../shared/ApiError');
const logger = require('../config/logger');

function errorHandler(error, _req, res, _next) {
  logger.error({ err: error }, 'Request failed');

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Unique constraint violated' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Requested resource was not found' });
    }
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors?.length ? { errors: error.errors } : {})
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}

module.exports = errorHandler;