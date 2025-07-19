// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  perfil: string;
  tenantId: string;
}

export class JWTService {
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'z-clinic',
      audience: 'z-clinic-users',
    });
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'z-clinic',
      audience: 'z-clinic-users',
    });
  }

  static verifyAccessToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'z-clinic',
        audience: 'z-clinic-users',
      }) as AuthTokenPayload;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  static verifyRefreshToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'z-clinic',
        audience: 'z-clinic-users',
      }) as AuthTokenPayload;
    } catch (error) {
      throw new Error('Refresh token inválido ou expirado');
    }
  }

  static getTokenFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token não fornecido ou formato inválido');
    }
    return authHeader.substring(7); // Remove "Bearer "
  }

  static getExpirationTime(): number {
    const expiresIn = JWT_EXPIRES_IN;
    if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60; // minutos para segundos
    }
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60; // horas para segundos
    }
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60; // dias para segundos
    }
    return 900; // 15 minutos default
  }
}