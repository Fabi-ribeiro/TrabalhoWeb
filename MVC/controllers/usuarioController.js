const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = {
  // Exibe a tela de login
  loginPage: (req, res) => {
    res.render('usuarios/login', { layout: 'auth' }); // usa o layout de login
  },

  // Faz login
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;
      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        return res.render('usuarios/login', {
          layout: 'auth',
          error: '❌ Usuário não encontrado!'
        });
      }

      // Compara senha com hash armazenado
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.render('usuarios/login', {
          layout: 'auth',
          error: '❌ E-mail ou senha incorretos!'
        });
      }

      req.session.usuario = usuario;
      res.redirect('/home');
    } catch (error) {
      console.error('Erro no login:', error);
      res.render('usuarios/login', { layout: 'auth', error: 'Erro ao tentar fazer login. Tente novamente.' });
    }
  },

  perfilPage: (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) return res.redirect('/login');

    res.render('perfil/perfil', {  
      layout: 'main',
      usuario
    });
  },

  updatePerfil: async (req, res) => {
    try {
      const usuario = req.session.usuario;
      if (!usuario) return res.redirect('/login');

      const { nome, email, departamento } = req.body;

      await Usuario.update(
        { nome, email, departamento },
        { where: { id: usuario.id } }
      );

      const atualizado = await Usuario.findByPk(usuario.id);
      req.session.usuario = atualizado;

      res.redirect('/usuarios/perfil'); 
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.render('perfil/perfil', {
        layout: 'main',
        usuario: req.session.usuario,
        error: 'Erro ao atualizar perfil!'
      });
    }
  }
  ,

  // Faz logout
  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  },

  // Exibe formulário de cadastro
  createForm: (req, res) => {
    res.render('usuarios/create', { layout: 'auth' });
  },

  // Cadastra novo usuário
  create: async (req, res) => {
    try {
      const { nome, email, registro, senha } = req.body;

      if (!nome || !email || !registro || !senha) {
        return res.render('usuarios/create', {
          layout: 'auth',
          error: '⚠️ Preencha todos os campos antes de continuar.'
        });
      }

      // Verifica se o e-mail já existe
      const existente = await Usuario.findOne({ where: { email } });
      if (existente) {
        return res.render('usuarios/create', {
          layout: 'auth',
          error: '⚠️ Já existe um usuário com este e-mail.'
        });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      await Usuario.create({
        nome,
        email,
        registro,
        senha: senhaHash,
        tipo_usuario: req.body.tipo_usuario || 'USER' // usa o tipo usuário selecionado no formulário
      });

      res.redirect('/login');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.render('usuarios/create', { layout: 'auth', error: '❌ Erro ao criar usuário.' });
    }
  }
};
