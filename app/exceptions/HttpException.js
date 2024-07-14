class HttpException extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors || [];
  }
}

module.exports = HttpException;
