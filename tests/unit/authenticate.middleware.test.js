describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('attaches the active user to the request', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z')
    });

    jest.doMock('../../src/lib/prisma', () => ({
      user: { findUnique }
    }));
    jest.doMock('../../src/shared/tokens', () => ({
      verifyAccessToken: jest.fn(() => ({ sub: 'user-1', type: 'access' }))
    }));

    const authenticate = require('../../src/middlewares/authenticate');
    const req = { headers: { authorization: 'Bearer access-token' } };
    const next = jest.fn();

    await authenticate(req, {}, next);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
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
    expect(req.user).toMatchObject({
      id: 'user-1',
      email: 'admin@example.com',
      role: 'ADMIN',
      status: 'ACTIVE'
    });
    expect(next).toHaveBeenCalledWith();
  });

  test('rejects requests with no bearer token', async () => {
    const authenticate = require('../../src/middlewares/authenticate');
    const next = jest.fn();

    await authenticate({ headers: {} }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401,
      message: 'Access token is required'
    }));
  });

  test('blocks inactive users', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Viewer User',
      email: 'viewer@example.com',
      role: 'VIEWER',
      status: 'INACTIVE'
    });

    jest.doMock('../../src/lib/prisma', () => ({
      user: { findUnique }
    }));
    jest.doMock('../../src/shared/tokens', () => ({
      verifyAccessToken: jest.fn(() => ({ sub: 'user-1', type: 'access' }))
    }));

    const authenticate = require('../../src/middlewares/authenticate');
    const next = jest.fn();

    await authenticate({ headers: { authorization: 'Bearer access-token' } }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403,
      message: 'Inactive users are blocked from this action'
    }));
  });
});
