-- ========================================
-- PLAYLOG DATABASE SETUP
-- ========================================

-- 1. Crear la base de datos (ejecutar como usuario postgres)
-- Si la base de datos ya existe, esta línea dará error (ignorar)
CREATE DATABASE playlog;

-- 2. Conectarse a la base de datos
\c playlog;

-- 3. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 5. Crear tabla de obras de teatro
CREATE TABLE IF NOT EXISTS shows (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    director VARCHAR(255),
    year INTEGER,
    genre VARCHAR(100),
    synopsis TEXT,
    poster_url VARCHAR(500),
    theater VARCHAR(255),
    location VARCHAR(100),
    duration INTEGER,
    language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shows_title ON shows(title);
CREATE INDEX IF NOT EXISTS idx_shows_year ON shows(year);

-- 6. Crear tabla de ratings y reseñas
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    review TEXT,
    date_watched DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, show_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_show ON ratings(show_id);

-- 7. Crear tabla de seguidores
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- 8. Crear tabla de listas personalizadas
CREATE TABLE IF NOT EXISTS lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Crear tabla intermedia: listas <-> obras
CREATE TABLE IF NOT EXISTS list_shows (
    id SERIAL PRIMARY KEY,
    list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(list_id, show_id)
);

-- 10. Verificar que todo se creó correctamente
\dt

-- Mensaje de éxito
SELECT 'Base de datos PlayLog creada exitosamente!' AS status;