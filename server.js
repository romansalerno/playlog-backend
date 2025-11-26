const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Bienvenido a PlayLog API!',
    version: '1.0.0'
  });
});

// Rutas
// Rutas
const authRoutes = require('./src/routes/auth.routes');
const showsRoutes = require('./src/routes/shows.routes');
const adminRoutes = require('./src/routes/admin.routes');
const ratingsRoutes = require('./src/routes/ratings.routes');

app.use('/api/auth', authRoutes);
app.use('/api/shows', showsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingsRoutes);
// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎭 Servidor corriendo en http://localhost:${PORT}`);
});
