const { z } = require('zod');
const validate = require('../../src/middlewares/validate');

describe('validate middleware', () => {
  test('replaces request data with parsed values', () => {
    const next = jest.fn();
    const middleware = validate(z.object({
      page: z.coerce.number().int().positive()
    }), 'query');
    const req = { query: { page: '2' } };

    middleware(req, {}, next);

    expect(req.query).toEqual({ page: 2 });
    expect(next).toHaveBeenCalledWith();
  });

  test('returns a structured validation error', () => {
    const next = jest.fn();
    const middleware = validate(z.object({
      email: z.string().email()
    }));

    middleware({ body: { email: 'not-an-email' } }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 400,
      message: 'Validation failed',
      errors: expect.arrayContaining([
        expect.objectContaining({
          path: 'email'
        })
      ])
    }));
  });
});
