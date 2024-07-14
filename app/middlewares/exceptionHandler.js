// eslint-disable-next-line no-unused-vars
function exceptionHandler(err, req, res, next) {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [
    {
      error_code: status,
      error_message: message,
    },
  ];

  res.status(status).json({
    is_success: false,
    data: null,
    message: message,
    errors: errors,
  });
}

module.exports = exceptionHandler;
