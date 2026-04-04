const { Router } = require('express');
const env = require('../config/env');
const { sendSuccess } = require('../shared/apiResponse');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const recordRoutes = require('../modules/records/record.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');

const router = Router();

router.get('/health', (_req, res) => {
  return sendSuccess(res, {
    message: 'API is healthy',
    data: {
      service: env.APP_NAME,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;