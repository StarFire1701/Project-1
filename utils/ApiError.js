class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details = null) {
    super(400, message, details);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details = null) {
    super(401, message, details);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details = null) {
    super(403, message, details);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Not Found', details = null) {
    super(404, message, details);
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Conflict', details = null) {
    super(409, message, details);
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', details = null) {
    super(500, message, details);
  }
}

export {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
