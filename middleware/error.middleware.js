import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  // If the error is an ApiError, use its statusCode and message.
  // Otherwise, treat it as a 500 internal server error.
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : 'Internal Server Error';

  const payload = {
    success: false,
    statusCode,
    message,
  };

  if (err instanceof ApiError && err.details) {
    payload.error = {
      type: err.name,
      details: err.details,
    };
  } else if (!(err instanceof ApiError)) {
    // In development, include stack for debugging (optional)
    if (process.env.NODE_ENV !== 'production') {
      payload.error = {
        type: err.name || 'Error',
        details: err.stack,
      };
    }
  }

  res.status(statusCode).json(payload);
};
