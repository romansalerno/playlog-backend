const express = require('express');
const router = express.Router();
const showsController = require('../controllers/shows.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas (no requieren autenticación)
router.get('/', showsController.getShows);
router.get('/search', showsController.searchShows);
router.get('/:id', showsController.getShowById);

// Rutas protegidas (requieren autenticación)
router.post('/', authMiddleware, showsController.createShow);
router.put('/:id', authMiddleware, showsController.updateShow);
router.delete('/:id', authMiddleware, showsController.deleteShow);

module.exports = router;