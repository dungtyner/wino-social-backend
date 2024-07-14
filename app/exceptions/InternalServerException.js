const HttpException = require('./HttpException');

class InternalServerException extends HttpException {
  constructor(message = 'Something errors') {
    super(500, message, [
      {
        error_code: 500,
        error_message: message,
      },
    ]);
  }
}

module.exports = InternalServerException;
