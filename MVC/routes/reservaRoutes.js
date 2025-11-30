const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

/* Listagem e histórico */
router.get('/list', isAuthenticated, reservaController.list);
router.get('/historico', isAuthenticated, reservaController.historico);
/* Reserva por item */
router.get('/item/:id', isAuthenticated, reservaController.createFromItemPage);
router.post('/item', isAuthenticated, reservaController.createFromItem);
/* Reserva por sala */
router.get('/sala/:id', isAuthenticated, reservaController.createFromSalaPage);
router.post('/sala/:id', isAuthenticated, reservaController.createFromSala);
/* Minhas reservas */
router.get('/minhas', isAuthenticated, reservaController.list);
/* Cancelamento (usado apenas POST) */
router.post('/cancelar/:id', isAuthenticated, reservaController.cancelar);

/* AÇÕES ADMINISTRATIVAS */
// Página com todas as reservas pendentes
router.get('/pendentes', isAuthenticated, isAdmin, reservaController.pendentes);

// Formulário de verificação da reserva
router.get('/verificar/:id', isAuthenticated, isAdmin, reservaController.verificarForm);

// POST para confirmar devolução/ocupação
router.post('/verificar/:id', isAuthenticated, isAdmin, reservaController.confirmarVerificacao);

module.exports = router;
