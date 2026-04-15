class ApiError extends Error {
  constructor(
    statusCode,
    message,
    code = 'INTERNAL_SERVER_ERROR',
    details = null
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST', details = null) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message, code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }

  static forbidden(message, code = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }

  static notFound(message, code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static internal(message, code = 'INTERNAL_SERVER_ERROR') {
    return new ApiError(500, message, code);
  }
}

module.exports = ApiError;
