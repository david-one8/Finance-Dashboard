const prisma = require('../lib/prisma');
const ApiError = require('../shared/ApiError');
const { verifyAccessToken } = require('../shared/tokens');
const { UserStatus } = require('../config/roles');

async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(new ApiError(401, 'Access token is required'));
    }

    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      return next(new ApiError(401, 'Invalid access token'));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    if (user.status !== UserStatus.ACTIVE) {
      return next(new ApiError(403, 'Inactive users are blocked from this action'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired access token'));
  }
}

module.exports = authenticate;