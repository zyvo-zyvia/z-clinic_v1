// src/middleware/supabaseAuth.ts
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const prisma = new PrismaClient();

// Estender Request para incluir dados do usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        authUserId: string;
        email: string;
        usuario: {
          id: string;
          nome: string;
          perfil: string;
          tenantId: string;
          ativo: boolean;
        };
      };
    }
  }
}

export const authenticateSupabase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn(`Token inválido: ${error?.message || 'Usuário não encontrado'}`);
      return res.status(401).json({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    // Buscar dados de negócio na nossa tabela
    const usuario = await prisma.usuario.findFirst({
      where: { 
        authUserId: user.id,
        tenantId: 'zclinic_v1',
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        perfil: true,
        tenantId: true,
        ativo: true
      }
    });

    if (!usuario) {
      logger.warn(`Usuário não encontrado ou inativo: ${user.email}`);
      return res.status(401).json({
        error: 'Usuário não encontrado ou inativo',
        code: 'USER_NOT_FOUND'
      });
    }

    // Adicionar dados ao request
    req.user = {
      authUserId: user.id,
      email: user.email!,
      usuario
    };

    logger.info(`Usuário autenticado: ${user.email} (${usuario.perfil})`);
    next();

  } catch (error) {
    logger.error('Erro na autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno na autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware para verificar perfis específicos
export const requirePerfil = (...allowedPerfis: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!allowedPerfis.includes(req.user.usuario.perfil)) {
      logger.warn(`Acesso negado para ${req.user.email} com perfil ${req.user.usuario.perfil}`);
      return res.status(403).json({
        error: 'Acesso negado. Perfil insuficiente.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPerfis: allowedPerfis,
        userPerfil: req.user.usuario.perfil
      });
    }

    next();
  };
};

// Middleware para verificar tenant (multi-tenant)
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Se for ADMINISTRADOR, pode acessar qualquer tenant
  if (req.user.usuario.perfil === 'ADMINISTRADOR') {
    return next();
  }

  // Verificar se o tenantId na URL/body bate com o do usuário
  const tenantId = req.params.tenantId || req.body.tenantId;
  
  if (tenantId && tenantId !== req.user.usuario.tenantId) {
    logger.warn(`Tentativa de acesso cross-tenant: ${req.user.email} tentando acessar ${tenantId}`);
    return res.status(403).json({
      error: 'Acesso negado. Você só pode acessar dados do seu tenant.',
      code: 'CROSS_TENANT_ACCESS_DENIED'
    });
  }

  next();
};