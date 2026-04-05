const authorize = require('../../src/middlewares/authorize');

describe('authorize middleware', () => {
  test('allows requests for permitted roles', () => {
    const next = jest.fn();
    const middleware = authorize('ADMIN', 'ANALYST');

    middleware({ user: { role: 'ADMIN' } }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('rejects unauthenticated requests', () => {
    const next = jest.fn();
    const middleware = authorize('ADMIN');

    middleware({}, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401,
      message: 'Authentication required'
    }));
  });

  test('rejects users without the required role', () => {
    const next = jest.fn();
    const middleware = authorize('ADMIN');

    middleware({ user: { role: 'VIEWER' } }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403,
      message: 'You do not have permission to perform this action'
    }));
  });
});
