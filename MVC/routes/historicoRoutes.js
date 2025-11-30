const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historicoController');
const { isAuthenticated } = require('../middlewares/auth');

// Página de histórico
router.get('/', isAuthenticated, historicoController.historico);

module.exports = router;
