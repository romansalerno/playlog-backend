const { query } = require('../config/database');

// CREAR OBRA
const createShow = async (req, res) => {
  try {
    const {
      title,
      author,
      director,
      year,
      genre,
      synopsis,
      poster_url,
      theater,
      location,
      duration,
      language
    } = req.body;

    // Validaciones
    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    // Crear obra
    const result = await query(
      `INSERT INTO shows (
        title, author, director, year, genre, synopsis, 
        poster_url, theater, location, duration, language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [title, author, director, year, genre, synopsis, poster_url, theater, location, duration, language || 'Spanish']
    );

    res.status(201).json({
      message: 'Obra creada exitosamente',
      show: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear obra:', error);
    res.status(500).json({ error: 'Error al crear obra' });
  }
};

// LISTAR OBRAS (con paginación)
const getShows = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Obtener obras
    const shows = await query(
      `SELECT * FROM shows 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Contar total
    const totalResult = await query('SELECT COUNT(*) FROM shows');
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      shows: shows.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener obras:', error);
    res.status(500).json({ error: 'Error al obtener obras' });
  }
};

// OBTENER UNA OBRA
const getShowById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM shows WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }

    res.json({ show: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener obra:', error);
    res.status(500).json({ error: 'Error al obtener obra' });
  }
};

// BUSCAR OBRAS
const searchShows = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
    }

    const result = await query(
      `SELECT * FROM shows 
       WHERE LOWER(title) LIKE LOWER($1) 
          OR LOWER(author) LIKE LOWER($1)
          OR LOWER(director) LIKE LOWER($1)
       ORDER BY created_at DESC 
       LIMIT 50`,
      [`%${q}%`]
    );

    res.json({
      shows: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al buscar obras:', error);
    res.status(500).json({ error: 'Error al buscar obras' });
  }
};

// ACTUALIZAR OBRA
const updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      director,
      year,
      genre,
      synopsis,
      poster_url,
      theater,
      location,
      duration,
      language
    } = req.body;

    // Verificar que existe
    const checkResult = await query('SELECT * FROM shows WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }

    // Actualizar
    const result = await query(
      `UPDATE shows SET 
        title = COALESCE($1, title),
        author = COALESCE($2, author),
        director = COALESCE($3, director),
        year = COALESCE($4, year),
        genre = COALESCE($5, genre),
        synopsis = COALESCE($6, synopsis),
        poster_url = COALESCE($7, poster_url),
        theater = COALESCE($8, theater),
        location = COALESCE($9, location),
        duration = COALESCE($10, duration),
        language = COALESCE($11, language),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [title, author, director, year, genre, synopsis, poster_url, theater, location, duration, language, id]
    );

    res.json({
      message: 'Obra actualizada exitosamente',
      show: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar obra:', error);
    res.status(500).json({ error: 'Error al actualizar obra' });
  }
};

// ELIMINAR OBRA
const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const checkResult = await query('SELECT * FROM shows WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }

    // Eliminar
    await query('DELETE FROM shows WHERE id = $1', [id]);

    res.json({ message: 'Obra eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar obra:', error);
    res.status(500).json({ error: 'Error al eliminar obra' });
  }
};

module.exports = {
  createShow,
  getShows,
  getShowById,
  searchShows,
  updateShow,
  deleteShow
};