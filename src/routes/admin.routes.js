const express = require('express');
const router = express.Router();
const showsController = require('../controllers/shows.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// Todas las rutas requieren auth + admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Rutas de moderación
router.get('/shows/pending', showsController.getPendingShows);
router.put('/shows/:id/approve', showsController.approveShow);
router.put('/shows/:id/reject', showsController.rejectShow);

module.exports = router;