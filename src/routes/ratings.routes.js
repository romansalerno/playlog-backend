const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratings.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas protegidas
router.post('/', authMiddleware, ratingsController.createOrUpdateRating);
router.get('/my', authMiddleware, ratingsController.getMyRatings);
router.get('/my/:showId', authMiddleware, ratingsController.getMyShowRating);
router.delete('/:showId', authMiddleware, ratingsController.deleteRating);

// Rutas públicas
router.get('/show/:showId', ratingsController.getShowRatings);

module.exports = router;