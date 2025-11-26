const { query } = require('../config/database');

// CREAR OBRA (ahora queda como 'pending')
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

    const userId = req.userId; // Del authMiddleware

    // Validaciones
    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    // Crear obra como PENDING
    const result = await query(
      `INSERT INTO shows (
        title, author, director, year, genre, synopsis, 
        poster_url, theater, location, duration, language,
        status, submitted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12)
      RETURNING *`,
      [title, author, director, year, genre, synopsis, poster_url, theater, location, duration, language || 'Spanish', userId]
    );

    res.status(201).json({
      message: 'Obra enviada para revisión. Un administrador la aprobará pronto.',
      show: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear obra:', error);
    res.status(500).json({ error: 'Error al crear obra' });
  }
};

// LISTAR OBRAS (solo las aprobadas)
const getShows = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Solo mostrar obras aprobadas
    const shows = await query(
      `SELECT * FROM shows 
       WHERE status = 'approved'
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Contar solo aprobadas
    const totalResult = await query("SELECT COUNT(*) FROM shows WHERE status = 'approved'");
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

// OBTENER OBRAS PENDIENTES (solo admin)
const getPendingShows = async (req, res) => {
  try {
    const result = await query(
      `SELECT shows.*, users.username as submitted_by_username
       FROM shows 
       LEFT JOIN users ON shows.submitted_by = users.id
       WHERE shows.status = 'pending'
       ORDER BY shows.created_at DESC`
    );

    res.json({
      shows: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener obras pendientes:', error);
    res.status(500).json({ error: 'Error al obtener obras pendientes' });
  }
};

// APROBAR OBRA (solo admin)
const approveShow = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE shows 
       SET status = 'approved', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Obra no encontrada o ya procesada' });
    }

    res.json({
      message: 'Obra aprobada exitosamente',
      show: result.rows[0]
    });
  } catch (error) {
    console.error('Error al aprobar obra:', error);
    res.status(500).json({ error: 'Error al aprobar obra' });
  }
};

// RECHAZAR OBRA (solo admin)
const rejectShow = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await query(
      `UPDATE shows 
       SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Obra no encontrada o ya procesada' });
    }

    res.json({
      message: 'Obra rechazada',
      show: result.rows[0]
    });
  } catch (error) {
    console.error('Error al rechazar obra:', error);
    res.status(500).json({ error: 'Error al rechazar obra' });
  }
};

module.exports = {
  createShow,
  getShows,
  getShowById,
  searchShows,
  updateShow,
  deleteShow,
  getPendingShows,
  approveShow,
  rejectShow
};

