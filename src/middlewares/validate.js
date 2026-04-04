const ApiError = require('../shared/ApiError');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new ApiError(400, 'Validation failed', result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        })))
      );
    }

    req[source] = result.data;
    next();
  };
}

module.exports = validate;