const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: passwordSchema
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  passwordSchema
};