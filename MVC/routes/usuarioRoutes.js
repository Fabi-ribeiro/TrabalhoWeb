const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Login / Logout
router.get('/login', usuarioController.loginPage);
router.post('/login', usuarioController.login);
router.get('/logout', usuarioController.logout);

// Perfil
router.get('/perfil', usuarioController.perfilPage);
router.post('/perfil/update', usuarioController.updatePerfil);

// Cadastro
router.get('/create', usuarioController.createForm);
router.post('/create', usuarioController.create);

module.exports = router;
