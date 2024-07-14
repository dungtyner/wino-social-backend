function successHandler(req, res, next) {
  res.success = (data, statusCode = 200, message = 'Success') => {
    res.status(statusCode).json({
      is_success: true,
      data,
      message,
      errors: [],
    });
  };

  next();
}

module.exports = successHandler;
