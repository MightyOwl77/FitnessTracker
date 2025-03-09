
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// In production, this would be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';
const JWT_EXPIRES_IN = '24h';

// Extended Request type with user property
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

// Generate a JWT token
export function generateToken(userId: number, username: string): string {
  return jwt.sign(
    { id: userId, username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare a password with a hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  // For development without token, allow the default user
  if (process.env.NODE_ENV === 'development' && !token) {
    req.user = { id: 1, username: 'user' };
    return next();
  }
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, username: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}
