const ApiError = require('../utils/apiError');

const REQUEST_SEGMENTS = ['params', 'query', 'body'];

const mapValidationDetails = (details = []) =>
  details.map((detail) => ({
    path: detail.path.join('.'),
    message: detail.message,
  }));

module.exports = (schemaMap) => (req, res, next) => {
  try {
    REQUEST_SEGMENTS.forEach((segment) => {
      const schema = schemaMap[segment];

      if (!schema) {
        return;
      }

      const { error, value } = schema.validate(req[segment], {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: false,
        convert: true,
      });

      if (error) {
        throw ApiError.badRequest(
          `Invalid ${segment} data`,
          'VALIDATION_ERROR',
          mapValidationDetails(error.details)
        );
      }

      req[segment] = value;
    });

    next();
  } catch (error) {
    next(error);
  }
};
