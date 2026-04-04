const { z } = require('zod');

const dashboardQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  recentLimit: z.coerce.number().int().positive().max(50).default(10)
}).refine((value) => {
  if (value.startDate && value.endDate) {
    return value.startDate <= value.endDate;
  }
  return true;
}, { message: 'startDate must be before or equal to endDate' });

module.exports = { dashboardQuerySchema };