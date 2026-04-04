const { z } = require('zod');
const { FinanceType } = require('../../config/roles');

const createRecordSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.nativeEnum(FinanceType),
  category: z.string().trim().min(2).max(60),
  date: z.coerce.date(),
  notes: z.string().trim().max(500).optional().nullable()
});

const updateRecordSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  type: z.nativeEnum(FinanceType).optional(),
  category: z.string().trim().min(2).max(60).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional().nullable()
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const listRecordsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.nativeEnum(FinanceType).optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  includeDeleted: z.coerce.boolean().default(false)
}).refine((value) => {
  if (value.startDate && value.endDate) {
    return value.startDate <= value.endDate;
  }
  return true;
}, { message: 'startDate must be before or equal to endDate' });

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  listRecordsQuerySchema
};