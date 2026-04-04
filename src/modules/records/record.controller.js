const asyncHandler = require('../../shared/asyncHandler');
const { sendSuccess } = require('../../shared/apiResponse');
const recordService = require('./record.service');

const createRecord = asyncHandler(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Record created successfully',
    data: record
  });
});

const listRecords = asyncHandler(async (req, res) => {
  const result = await recordService.listRecords(req.query, req.user);
  return sendSuccess(res, {
    message: 'Records fetched successfully',
    data: result.items,
    meta: result.meta
  });
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id, req.user);
  return sendSuccess(res, {
    message: 'Record fetched successfully',
    data: record
  });
});

const updateRecord = asyncHandler(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body, req.user);
  return sendSuccess(res, {
    message: 'Record updated successfully',
    data: record
  });
});

const softDeleteRecord = asyncHandler(async (req, res) => {
  const record = await recordService.softDeleteRecord(req.params.id, req.user);
  return sendSuccess(res, {
    message: 'Record soft deleted successfully',
    data: record
  });
});

module.exports = {
  createRecord,
  listRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord
};