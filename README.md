# PlayLog Backend

API REST para la aplicación PlayLog - Letterboxd para obras de teatro.

## 🚀 Inicio Rápido

### Instalar dependencias
```bash
npm install
```

### Iniciar servidor en modo desarrollo
```bash
npm run dev
```

El servidor correrá en `http://localhost:3000`

### Iniciar servidor en producción
```bash
npm start
```

## 📁 Estructura del Proyecto

```
playlog-backend/
├── server.js              # Archivo principal del servidor
├── .env                   # Variables de entorno
├── package.json           # Dependencias y scripts
└── src/
    ├── config/           # Configuración (DB, etc)
    ├── routes/           # Rutas de la API
    ├── controllers/      # Lógica de negocio
    └── middleware/       # Middleware (autenticación, etc)
```

## 🔧 Tecnologías

- **Express**: Framework web
- **PostgreSQL**: Base de datos
- **JWT**: Autenticación
- **bcryptjs**: Hash de contraseñas
- **CORS**: Permitir peticiones desde el frontend

## 📝 Variables de Entorno

Configura estas variables en el archivo `.env`:

- `PORT`: Puerto del servidor (default: 3000)
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NODE_ENV`: Entorno (development/production)

## 🔜 Próximos Pasos

1. Configurar PostgreSQL
2. Crear tabla de usuarios
3. Implementar registro/login
4. Crear rutas protegidas
5. Agregar tabla de obras de teatro
