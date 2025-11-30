const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { Usuario } = require('../models'); 

router.get('/', perfilController.perfilPage);
router.post('/update', perfilController.updatePerfil);
router.post('/updateSenha', perfilController.updateSenha);

router.post("/excluirConta", async (req, res) => {
  try {
    const userId = req.session.usuario.id; //

    await Usuario.destroy({ where: { id: userId } });

    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log("Erro ao excluir conta:", error);
    res.redirect("/perfil?erro=Erro ao excluir sua conta.");
  }
});

module.exports = router;
