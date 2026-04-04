const asyncHandler = require('../../shared/asyncHandler');
const { sendSuccess } = require('../../shared/apiResponse');
const dashboardService = require('./dashboard.service');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary(req.query);
  return sendSuccess(res, {
    message: 'Dashboard summary fetched successfully',
    data: summary
  });
});

module.exports = { getDashboardSummary };