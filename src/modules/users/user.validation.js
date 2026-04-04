const { z } = require('zod');
const { UserRole, UserStatus } = require('../../config/roles');
const { passwordSchema } = require('../auth/auth.validation');

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: passwordSchema,
  role: z.nativeEnum(UserRole).default(UserRole.VIEWER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE)
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().optional(),
  password: passwordSchema.optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(UserStatus)
});

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().trim().optional()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  listUsersQuerySchema
};