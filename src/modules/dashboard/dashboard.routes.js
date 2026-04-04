const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const controller = require('./dashboard.controller');
const { dashboardQuerySchema } = require('./dashboard.validation');
const { UserRole } = require('../../config/roles');

const router = Router();

router.get(
  '/summary',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER),
  validate(dashboardQuerySchema, 'query'),
  controller.getDashboardSummary
);

module.exports = router;