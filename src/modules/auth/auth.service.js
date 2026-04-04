const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const prisma = require('../../lib/prisma');
const env = require('../../config/env');
const ApiError = require('../../shared/ApiError');
const { hashToken } = require('../../shared/crypto');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../shared/tokens');
const { UserRole, UserStatus } = require('../../config/roles');

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function createSession(user) {
  const jti = randomUUID();
  const refreshToken = signRefreshToken({ userId: user.id, jti });
  const accessToken = signAccessToken(user);
  const decoded = jwt.decode(refreshToken);

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      jti,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000)
    }
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshTokenExpiresIn: env.JWT_REFRESH_EXPIRES_IN
  };
}

async function register(payload) {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE
    }
  });

  const tokens = await createSession(user);
  return { user: sanitizeUser(user), tokens };
}

async function login(payload) {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new ApiError(403, 'Inactive users are blocked from login');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokens = await createSession(user);
  return { user: sanitizeUser(user), tokens };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'Invalid refresh token type');
  }

  const session = await prisma.refreshSession.findFirst({
    where: {
      jti: payload.jti,
      userId: payload.sub,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (!session || session.tokenHash !== hashToken(refreshToken)) {
    throw new ApiError(401, 'Refresh session is invalid or revoked');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new ApiError(403, 'Inactive users are blocked from refresh operations');
  }

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() }
  });

  const tokens = await createSession(user);
  return { user: sanitizeUser(user), tokens };
}

async function logout(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    payload = jwt.decode(refreshToken);
  }

  if (!payload?.jti || !payload?.sub) {
    return { revoked: false };
  }

  await prisma.refreshSession.updateMany({
    where: {
      jti: payload.jti,
      userId: payload.sub,
      revokedAt: null
    },
    data: { revokedAt: new Date() }
  });

  return { revoked: true };
}

async function logoutAll(userId) {
  const result = await prisma.refreshSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  return { revokedSessions: result.count };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getCurrentUser,
  sanitizeUser
};