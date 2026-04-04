const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');
const env = require('../../config/env');
const ApiError = require('../../shared/ApiError');
const { getPagination } = require('../../shared/pagination');
const { sanitizeUser } = require('../auth/auth.service');

function buildUserWhereClause(query) {
  const where = {};

  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  return where;
}

async function createUser(payload) {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role,
      status: payload.status
    }
  });

  return sanitizeUser(user);
}

async function listUsers(query) {
  const { page, limit, skip } = getPagination(query);
  const where = buildUserWhereClause(query);

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return {
    items: items.map(sanitizeUser),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return sanitizeUser(user);
}

async function updateUser(id, payload) {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new ApiError(404, 'User not found');
  }

  if (payload.email && payload.email !== existingUser.email) {
    const duplicate = await prisma.user.findUnique({ where: { email: payload.email } });
    if (duplicate) {
      throw new ApiError(409, 'Email is already registered');
    }
  }

  const updateData = { ...payload };
  if (payload.password) {
    updateData.passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_ROUNDS);
    delete updateData.password;
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData
  });

  return sanitizeUser(user);
}

async function updateUserStatus(id, status) {
  const user = await prisma.user.update({
    where: { id },
    data: { status }
  });

  return sanitizeUser(user);
}

module.exports = {
  buildUserWhereClause,
  createUser,
  listUsers,
  getUserById,
  updateUser,
  updateUserStatus
};