describe('authService.logout', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('rejects attempts to revoke another users session', async () => {
    const updateMany = jest.fn();

    jest.doMock('../../src/lib/prisma', () => ({
      refreshSession: { updateMany }
    }));
    jest.doMock('../../src/config/env', () => ({
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      BCRYPT_ROUNDS: 12
    }));
    jest.doMock('../../src/shared/tokens', () => ({
      verifyRefreshToken: jest.fn(() => ({ sub: 'user-2', jti: 'session-1', type: 'refresh' })),
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn()
    }));

    const authService = require('../../src/modules/auth/auth.service');

    await expect(authService.logout('refresh-token', 'user-1')).rejects.toMatchObject({
      statusCode: 403,
      message: 'You can only revoke your own sessions'
    });
    expect(updateMany).not.toHaveBeenCalled();
  });

  test('revokes the matching session for the authenticated user', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });

    jest.doMock('../../src/lib/prisma', () => ({
      refreshSession: { updateMany }
    }));
    jest.doMock('../../src/config/env', () => ({
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      BCRYPT_ROUNDS: 12
    }));
    jest.doMock('../../src/shared/tokens', () => ({
      verifyRefreshToken: jest.fn(() => ({ sub: 'user-1', jti: 'session-1', type: 'refresh' })),
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn()
    }));

    const authService = require('../../src/modules/auth/auth.service');

    await expect(authService.logout('refresh-token', 'user-1')).resolves.toEqual({ revoked: true });
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        jti: 'session-1',
        userId: 'user-1',
        revokedAt: null
      },
      data: { revokedAt: expect.any(Date) }
    });
  });
});
