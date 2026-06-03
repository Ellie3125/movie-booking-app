module.exports = (err, req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal Server Error';

  if (
    req.originalUrl.startsWith('/gateway/pay') &&
    !req.originalUrl.startsWith('/gateway/api')
  ) {
    return res.status(statusCode).render('error', {
      title: 'Fake Payment Gateway Error',
      statusCode,
      code,
      message,
    });
  }

  const responseBody = {
    success: false,
    message,
    error: code,
  };

  if (Array.isArray(err.details) && err.details.length > 0) {
    responseBody.details = err.details;
  }

  return res.status(statusCode).json(responseBody);
};
