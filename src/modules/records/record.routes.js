const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const controller = require('./record.controller');
const { createRecordSchema, updateRecordSchema, listRecordsQuerySchema } = require('./record.validation');
const { UserRole } = require('../../config/roles');

const router = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.ANALYST), validate(listRecordsQuerySchema, 'query'), controller.listRecords);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.ANALYST), controller.getRecordById);
router.post('/', authorize(UserRole.ADMIN), validate(createRecordSchema), controller.createRecord);
router.patch('/:id', authorize(UserRole.ADMIN), validate(updateRecordSchema), controller.updateRecord);
router.delete('/:id', authorize(UserRole.ADMIN), controller.softDeleteRecord);

module.exports = router;