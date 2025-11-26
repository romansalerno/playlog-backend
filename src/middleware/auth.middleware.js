const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado. Token no proporcionado' 
      });
    }

    // Extraer el token (quitar "Bearer ")
    const token = authHeader.substring(7);

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar userId al request para usarlo en los controladores
    req.userId = decoded.id;

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: 'Error al verificar token' });
  }
};

module.exports = authMiddleware;