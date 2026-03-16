import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../utils/ApiError.js'

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedError('Authentication Failed');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Normalize JWT verification errors into UnauthorizedError
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }

    next(err);
  }
};