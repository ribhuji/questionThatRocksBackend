class ErrorResponse extends Error {
  constructor(message, status) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.status = status;
  }
}

module.exports = ErrorResponse;
