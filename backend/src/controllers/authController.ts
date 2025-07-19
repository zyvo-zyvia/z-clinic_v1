// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { JWTService } from '../utils/jwt';
import { logger } from '../utils/logger';
import { loginSchema, refreshTokenSchema } from '../schemas/auth';
import { LoginResponse } from '../types/auth';

const prisma = new PrismaClient();

export class AuthController {
  // POST /api/auth/login
  static async login(req: Request, res: Response) {
    try {
      // Validação dos dados
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      logger.info(`Tentativa de login para: ${email}`);

      // Buscar usuário no banco (schema zclinic)
      const user = await prisma.usuario.findUnique({
        where: { 
          email: email.toLowerCase(),
          tenantId: 'zclinic_v1',
          ativo: true
        }
      });

      if (!user) {
        logger.warn(`Tentativa de login com email inexistente: ${email}`);
        return res.status(401).json({
          error: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Verificar se usuário está ativo
      if (!user.ativo) {
        logger.warn(`Tentativa de login com usuário inativo: ${email}`);
        return res.status(401).json({
          error: 'Usuário inativo. Entre em contato com o administrador.',
          code: 'USER_INACTIVE'
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.senha);
      if (!isPasswordValid) {
        logger.warn(`Tentativa de login com senha incorreta: ${email}`);
        return res.status(401).json({
          error: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Gerar tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        perfil: user.perfil,
        tenantId: user.tenantId
      };

      const accessToken = JWTService.generateAccessToken(tokenPayload);
      const refreshToken = JWTService.generateRefreshToken(tokenPayload);

      // Atualizar último login
      await prisma.usuario.update({
        where: { id: user.id },
        data: { ultimoLoginEm: new Date() }
      });

      // Preparar resposta (sem senha)
      const { senha: _, ...userWithoutPassword } = user;
      
      const response: LoginResponse = {
        user: userWithoutPassword,
        token: accessToken,
        refreshToken,
        expiresIn: JWTService.getExpirationTime()
      };

      logger.info(`Login realizado com sucesso: ${email}`);
      res.json(response);

    } catch (error: any) {
      logger.error('Erro no login:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // POST /api/auth/refresh
  static async refresh(req: Request, res: Response) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const { refreshToken } = validatedData;

      // Verificar refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      // Verificar se usuário ainda existe e está ativo
      const user = await prisma.usuario.findUnique({
        where: { 
          id: decoded.userId,
          tenantId: 'zclinic_v1',
          ativo: true
        }
      });

      if (!user || !user.ativo) {
        return res.status(401).json({
          error: 'Usuário inativo',
          code: 'USER_INACTIVE'
        });
      }

      // Gerar novo access token
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        perfil: user.perfil,
        tenantId: user.tenantId
      };

      const newAccessToken = JWTService.generateAccessToken(tokenPayload);

      res.json({
        token: newAccessToken,
        expiresIn: JWTService.getExpirationTime()
      });

      logger.info(`Token atualizado para usuário: ${user.email}`);

    } catch (error: any) {
      logger.error('Erro ao atualizar token:', error);
      
      if (error.message.includes('Token')) {
        return res.status(401).json({
          error: error.message,
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // GET /api/auth/me
  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Buscar dados atualizados do usuário
      const user = await prisma.usuario.findUnique({
        where: { 
          id: req.user.userId,
          tenantId: 'zclinic_v1'
        },
        select: {
          id: true,
          email: true,
          nome: true,
          perfil: true,
          tenantId: true,
          ativo: true,
          createdAt: true,
          updatedAt: true,
          ultimoLoginEm: true
        }
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json(user);

    } catch (error) {
      logger.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // POST /api/auth/logout
  static async logout(req: Request, res: Response) {
    try {
      // Note: Em uma implementação real, você poderia:
      // 1. Invalidar o token em um blacklist (Redis)
      // 2. Registrar o logout no banco
      // 3. Limpar sessões relacionadas

      if (req.user) {
        logger.info(`Logout realizado: ${req.user.email}`);
      }

      res.json({
        message: 'Logout realizado com sucesso',
        code: 'LOGOUT_SUCCESS'
      });

    } catch (error) {
      logger.error('Erro no logout:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}