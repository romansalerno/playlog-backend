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

// Rutas (las agregaremos después)
// app.use('/api/auth', require('./src/routes/auth'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🎭 Servidor corriendo en http://localhost:${PORT}`);
});
