module.exports = (err, req, res, next) => {
  console.error(err);

  const responseBody = {
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.code || 'INTERNAL_SERVER_ERROR'
  };

  if (Array.isArray(err.details) && err.details.length > 0) {
    responseBody.details = err.details;
  }

  res.status(err.statusCode || 500).json(responseBody);
};
