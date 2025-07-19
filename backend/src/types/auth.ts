// src/types/auth.ts
import { PerfilUsuario } from '@prisma/client';

export interface Usuario {
  id: string;
  tenantId: string;
  email: string;
  nome: string;
  telefone?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  ultimoLoginEm?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<Usuario, 'senha'>;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  perfil: string;
  tenantId: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Middleware Request com user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}