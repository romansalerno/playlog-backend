const { query } = require('../config/database');

// CREAR O ACTUALIZAR RATING
const createOrUpdateRating = async (req, res) => {
  try {
    const userId = req.userId;
    const { show_id, rating, review, date_watched } = req.body;

    // Validaciones
    if (!show_id || rating === undefined) {
      return res.status(400).json({ error: 'show_id y rating son obligatorios' });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'El rating debe estar entre 0 y 5' });
    }

    // Verificar que la obra existe y está aprobada
    const showCheck = await query(
      "SELECT id FROM shows WHERE id = $1 AND status = 'approved'",
      [show_id]
    );

    if (showCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }

    // Insertar o actualizar (upsert)
    const result = await query(
      `INSERT INTO ratings (user_id, show_id, rating, review, date_watched)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, show_id) 
       DO UPDATE SET 
         rating = $3,
         review = $4,
         date_watched = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, show_id, rating, review, date_watched]
    );

    res.status(201).json({
      message: 'Rating guardado exitosamente',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear/actualizar rating:', error);
    res.status(500).json({ error: 'Error al guardar rating' });
  }
};

// OBTENER RATINGS DE UNA OBRA
const getShowRatings = async (req, res) => {
  try {
    const { showId } = req.params;

    // Obtener ratings con info de usuario
    const ratings = await query(
      `SELECT ratings.*, users.username, users.avatar_url
       FROM ratings
       JOIN users ON ratings.user_id = users.id
       WHERE ratings.show_id = $1
       ORDER BY ratings.created_at DESC`,
      [showId]
    );

    // Calcular promedio
    const avgResult = await query(
      'SELECT AVG(rating)::numeric(10,1) as average, COUNT(*) as count FROM ratings WHERE show_id = $1',
      [showId]
    );

    res.json({
      ratings: ratings.rows,
      stats: {
        average: parseFloat(avgResult.rows[0].average) || 0,
        count: parseInt(avgResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error al obtener ratings:', error);
    res.status(500).json({ error: 'Error al obtener ratings' });
  }
};

// OBTENER MIS RATINGS
const getMyRatings = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT ratings.*, shows.title, shows.author, shows.year, shows.poster_url
       FROM ratings
       JOIN shows ON ratings.show_id = shows.id
       WHERE ratings.user_id = $1
       ORDER BY ratings.created_at DESC`,
      [userId]
    );

    res.json({
      ratings: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener mis ratings:', error);
    res.status(500).json({ error: 'Error al obtener ratings' });
  }
};

// OBTENER MI RATING DE UNA OBRA ESPECÍFICA
const getMyShowRating = async (req, res) => {
  try {
    const userId = req.userId;
    const { showId } = req.params;

    const result = await query(
      'SELECT * FROM ratings WHERE user_id = $1 AND show_id = $2',
      [userId, showId]
    );

    if (result.rows.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener rating:', error);
    res.status(500).json({ error: 'Error al obtener rating' });
  }
};

// ELIMINAR RATING
const deleteRating = async (req, res) => {
  try {
    const userId = req.userId;
    const { showId } = req.params;

    const result = await query(
      'DELETE FROM ratings WHERE user_id = $1 AND show_id = $2 RETURNING *',
      [userId, showId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating no encontrado' });
    }

    res.json({ message: 'Rating eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar rating:', error);
    res.status(500).json({ error: 'Error al eliminar rating' });
  }
};

module.exports = {
  createOrUpdateRating,
  getShowRatings,
  getMyRatings,
  getMyShowRating,
  deleteRating
};