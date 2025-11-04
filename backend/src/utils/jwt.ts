import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types/auth.js';
import { logger } from './logger.js';

const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || '7d';

export function generateToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): string {
  try {
    const token = jwt.sign(payload as jwt.JwtPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    } as jwt.SignOptions);
    return token;
  } catch (error) {
    logger.error('Error generating JWT:', error);
    throw new Error('Failed to generate token');
  }
}

export function verifyToken(token: string): AuthPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload;
  } catch (error) {
    logger.error('Error verifying JWT:', error);
    throw new Error('Invalid or expired token');
  }
}

export function decodeToken(token: string): AuthPayload | null {
  try {
    const payload = jwt.decode(token) as AuthPayload;
    return payload;
  } catch (error) {
    return null;
  }
}
