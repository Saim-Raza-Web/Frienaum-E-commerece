import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'MERCHANT' | 'CUSTOMER';
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, options?: SignOptions): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    ...options,
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
