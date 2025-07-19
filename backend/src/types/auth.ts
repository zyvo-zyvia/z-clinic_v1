export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ATENDENTE' | 'MEDICO';
  clinicId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  clinicId: string;
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
