const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Login
router.get('/login', usuarioController.loginPage);
router.post('/login', usuarioController.login);

// Logout
router.get('/logout', usuarioController.logout);

module.exports = router;
