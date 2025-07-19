// src/routes/auth.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Fazer login do usuário
 * @access Public
 * @body { email: string, password: string }
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/refresh
 * @desc Atualizar access token usando refresh token
 * @access Public
 * @body { refreshToken: string }
 */
router.post('/refresh', AuthController.refresh);

/**
 * @route GET /api/auth/me
 * @desc Obter dados do usuário autenticado
 * @access Private
 * @headers Authorization: Bearer <token>
 */
router.get('/me', authenticateToken, AuthController.me);

/**
 * @route POST /api/auth/logout
 * @desc Fazer logout do usuário
 * @access Private
 * @headers Authorization: Bearer <token>
 */
router.post('/logout', authenticateToken, AuthController.logout);

export default router;
