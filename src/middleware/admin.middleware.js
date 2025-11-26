const { query } = require('../config/database');

const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId; // Del authMiddleware

    // Obtener usuario
    const result = await query('SELECT role FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // Verificar que sea admin o moderator
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Error en adminMiddleware:', error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
};

module.exports = adminMiddleware;