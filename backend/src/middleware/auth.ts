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

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Acesso negado para usuário ${req.user.email} com role ${req.user.role}. Roles permitidas: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        error: 'Acesso negado. Permissões insuficientes.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: req.user.role
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

  // Se for ADMIN, pode acessar qualquer clínica
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Verificar se o clinicId na URL/body bate com o do usuário
  const clinicId = req.params.clinicId || req.body.clinicId;
  
  if (clinicId && clinicId !== req.user.clinicId) {
    logger.warn(`Tentativa de acesso cross-clinic: usuário ${req.user.email} tentando acessar clínica ${clinicId}`);
    return res.status(403).json({
      error: 'Acesso negado. Você só pode acessar dados da sua clínica.',
      code: 'CROSS_CLINIC_ACCESS_DENIED'
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
