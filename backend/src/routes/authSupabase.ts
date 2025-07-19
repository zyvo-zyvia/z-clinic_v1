// src/routes/authSupabase.ts
import { Router } from 'express';
import { authenticateSupabase, requirePerfil } from '../middleware/supabaseAuth';

const router = Router();

/**
 * @route GET /api/auth/me
 * @desc Obter dados do usuário autenticado (versão Supabase)
 * @access Private
 * @headers Authorization: Bearer <supabase_jwt_token>
 */
router.get('/me', authenticateSupabase, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const response = {
      authUserId: req.user.authUserId,
      email: req.user.email,
      usuario: req.user.usuario,
      message: 'Autenticação Supabase funcionando!'
    };

    res.json(response);

  } catch (error) {
    console.error('Erro em /me:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route GET /api/auth/admin-only
 * @desc Rota apenas para administradores (teste de permissões)
 * @access Private (ADMINISTRADOR only)
 */
router.get('/admin-only', 
  authenticateSupabase, 
  requirePerfil('ADMINISTRADOR'), 
  (req, res) => {
    res.json({
      message: '🎉 Acesso de administrador funcionando!',
      user: req.user?.usuario.nome,
      perfil: req.user?.usuario.perfil
    });
  }
);

/**
 * @route GET /api/auth/perfil
 * @desc Informações sobre o perfil do usuário
 * @access Private
 */
router.get('/perfil', authenticateSupabase, (req, res) => {
  const { usuario } = req.user!;
  
  res.json({
    perfil: usuario.perfil,
    permissoes: getPermissoesByPerfil(usuario.perfil),
    tenant: usuario.tenantId
  });
});

// Helper function para mapear permissões
function getPermissoesByPerfil(perfil: string) {
  const permissoes = {
    ADMINISTRADOR: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_campaigns'],
    GERENTE: ['create', 'read', 'update', 'manage_campaigns'],
    RECEPCIONISTA: ['create', 'read', 'update'],
    MEDICO: ['read', 'update_own_appointments']
  };

  return permissoes[perfil as keyof typeof permissoes] || ['read'];
}

export default router;