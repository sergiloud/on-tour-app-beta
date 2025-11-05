import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * Enterprise JWT Payload
 * Encodes organization and permission info for stateless authentication
 */
export interface JwtPayload {
  userId: string;       // sub: User ID
  organizationId: string; // org: Organization ID (cannot be spoofed)
  email: string;
  role?: string;        // User role (admin, manager, viewer, etc.)
  permissions?: string[]; // Fine-grained permissions array
  scope?: string;       // 'superadmin' for cross-tenant access
  iat?: number;         // Issued at
  exp?: number;         // Expiration
}

export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function extractToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
