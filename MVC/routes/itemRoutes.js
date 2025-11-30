const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { Item } = require('../models');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Listagem de itens
router.get('/', async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const itens = await Item.findAll({ raw: true });
    res.render('itens/list', {
      itens,
      usuario,
      isAdmin: usuario && usuario.tipo_usuario === 'ADMIN'
    });
  } catch (err) {
    console.error('Erro ao listar itens:', err);
    res.status(500).send('Erro ao listar itens.');
  }
});

// Página de criação de item (somente ADM)
router.get('/create', isAuthenticated, isAdmin, itemController.createForm);

// Envio do formulário de criação
router.post('/create', isAuthenticated, isAdmin, itemController.createItem);

// Formulário de edição
router.get('/edit/:id', isAuthenticated, isAdmin, itemController.editForm);

// Atualização
router.post('/edit/:id', isAuthenticated, isAdmin, itemController.updateItem);

// Exclusão
router.post('/delete/:id', isAuthenticated, isAdmin, itemController.deleteItem);

// Formulário de reserva (quando clica em "Reservar" no card)
router.get('/reserva/:id', isAuthenticated, async (req, res) => {
  try {
    const { Item } = require('../models');
    const item = await Item.findByPk(req.params.id, { raw: true });
    if (!item) return res.status(404).send('Item não encontrado');

    res.render('reservas/create', {
      layout: 'main',
      item,
      usuario: req.session.usuario
    });
  } catch (error) {
    console.error('Erro ao carregar formulário de reserva do item:', error);
    res.status(500).send('Erro ao carregar formulário de reserva do item.');
  }
});

module.exports = router;
