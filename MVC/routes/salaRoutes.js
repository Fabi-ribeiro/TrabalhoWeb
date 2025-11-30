const express = require('express');
const router = express.Router();
const salasController = require('../controllers/salaController');

router.get('/list', salasController.listar); 
router.get('/create', salasController.createForm);
router.post('/create', salasController.create);
router.get('/edit/:id', salasController.editForm);
router.post('/edit/:id', salasController.update);
router.post('/delete/:id', salasController.delete);

module.exports = router;
