// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { logger } from '../utils/logger';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        code: 'NO_TOKEN'
      });
    }

    const token = JWTService.getTokenFromHeader(authHeader);
    const decoded = JWTService.verifyAccessToken(token);
    
    // Adiciona user ao request
    req.user = decoded;
    
    logger.info(`Usuário autenticado: ${decoded.email}`);
    next();
    
  } catch (error) {
    logger.warn(`Tentativa de acesso com token inválido: ${error}`);
    return res.status(401).json({
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware para verificar roles específicas
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.user.perfil)) {
      logger.warn(`Acesso negado para usuário ${req.user.email} com perfil ${req.user.perfil}. Perfis permitidos: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        error: 'Acesso negado. Permissões insuficientes.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: req.user.perfil
      });
    }

    next();
  };
};

// Middleware para verificar se pertence à mesma clínica
export const requireSameClinic = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Se for ADMINISTRADOR, pode acessar qualquer tenant
  if (req.user.perfil === 'ADMINISTRADOR') {
    return next();
  }

  // Verificar se o tenantId na URL/body bate com o do usuário
  const tenantId = req.params.tenantId || req.body.tenantId;
  
  if (tenantId && tenantId !== req.user.tenantId) {
    logger.warn(`Tentativa de acesso cross-tenant: usuário ${req.user.email} tentando acessar tenant ${tenantId}`);
    return res.status(403).json({
      error: 'Acesso negado. Você só pode acessar dados do seu tenant.',
      code: 'CROSS_TENANT_ACCESS_DENIED'
    });
  }

  next();
};

// Middleware opcional - não falha se não tiver token
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = JWTService.getTokenFromHeader(authHeader);
      const decoded = JWTService.verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Ignora erros e continua sem user
    next();
  }
};