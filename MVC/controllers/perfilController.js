const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = {
  perfilPage: (req, res) => {
    if (!req.session.usuario) return res.redirect('/login');

    res.render('perfil/perfil', {
      layout: 'main',
      usuario: req.session.usuario,
      current: 'perfil'
    });
  },

  updatePerfil: async (req, res) => {
    try {
      const usuario = req.session.usuario;
      if (!usuario) return res.redirect('/login');

      const { nome, telefone, departamento } = req.body;

      await Usuario.update(
        { nome, telefone, departamento },
        { where: { id: usuario.id } }
      );

      // Atualiza sessão com objeto puro
      const atualizado = await Usuario.findByPk(usuario.id);
      req.session.usuario = atualizado.get({ plain: true });

      res.redirect('/perfil');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);

      res.render('perfil/perfil', {
        layout: 'main',
        usuario: req.session.usuario,
        error: 'Erro ao atualizar perfil!'
      });
    }
  },

  uploadFoto: async (req, res) => {
    try {
      if (!req.file) return res.redirect('/perfil');

      await Usuario.update(
        { foto: "/uploads/usuarios/" + req.file.filename },
        { where: { id: req.session.usuario.id } }
      );

      req.session.usuario.foto = "/uploads/usuarios/" + req.file.filename;

      res.redirect('/perfil');
    } catch (e) {
      console.log(e);
      res.status(500).send("Erro ao subir imagem");
    }
  },

  updateSenha: async (req, res) => {
    try {
      const usuario = req.session.usuario;
      const { senha_atual, nova_senha, confirmar_senha } = req.body;

      if (nova_senha !== confirmar_senha) {
        return res.render("perfil/perfil", {
          layout: "main",
          usuario,
          current: "perfil",
          erroSenha: "As senhas não coincidem!"
        });
      }

      const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senha);

      if (!senhaCorreta) {
        return res.render("perfil/perfil", {
          layout: "main",
          usuario,
          current: "perfil",
          erroSenha: "Senha atual incorreta!"
        });
      }

      const hash = await bcrypt.hash(nova_senha, 10);

      await Usuario.update(
        { senha: hash },
        { where: { id: usuario.id } }
      );

      res.render("perfil/perfil", {
        layout: "main",
        usuario,
        current: "perfil",
        sucessoSenha: "Senha alterada com sucesso!"
      });

    } catch (error) {
      console.log(error);
      res.render("perfil/perfil", {
        layout: "main",
        usuario: req.session.usuario,
        current: "perfil",
        erroSenha: "Erro ao atualizar senha!"
      });
    }
  }
}
