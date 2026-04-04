const { Router } = require('express');
const validate = require('../../middlewares/validate');
const authenticate = require('../../middlewares/authenticate');
const controller = require('./auth.controller');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.validation');

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/logout', authenticate, validate(refreshSchema), controller.logout);
router.post('/logout-all', authenticate, controller.logoutAll);
router.get('/me', authenticate, controller.me);

module.exports = router;