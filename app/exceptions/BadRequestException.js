const HttpException = require('./HttpException');

class BadRequestException extends HttpException {
  constructor(errors, message = 'Bad request') {
    super(400, message, errors);
  }
}

module.exports = BadRequestException;
