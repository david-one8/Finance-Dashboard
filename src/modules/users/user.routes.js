const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const controller = require('./user.controller');
const { createUserSchema, updateUserSchema, updateStatusSchema, listUsersQuerySchema } = require('./user.validation');
const { UserRole } = require('../../config/roles');

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/', validate(listUsersQuerySchema, 'query'), controller.listUsers);
router.post('/', validate(createUserSchema), controller.createUser);
router.get('/:id', controller.getUserById);
router.patch('/:id', validate(updateUserSchema), controller.updateUser);
router.patch('/:id/status', validate(updateStatusSchema), controller.updateUserStatus);

module.exports = router;