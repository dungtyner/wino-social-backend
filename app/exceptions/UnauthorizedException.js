const HttpException = require('./HttpException');

class UnauthorizedException extends HttpException {
  constructor(message = 'unauthorized') {
    super(401, message, [
      {
        error_code: 401,
        error_message: message,
      },
    ]);
  }
}

module.exports = UnauthorizedException;
