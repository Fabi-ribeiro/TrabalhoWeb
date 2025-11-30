const express = require('express');
const session = require('express-session');
const path = require('path');
const { engine } = require('express-handlebars');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const sequelize = require('./config/database');
const { Item, Sala } = require('./models');

// Rotas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const salaRoutes = require('./routes/salaRoutes');
const itemRoutes = require('./routes/itemRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const historicoRoutes = require('./routes/historicoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const { home } = require('./controllers/homeController');

const app = express();

// Registra helper globalmente
const hbs = require('hbs');
hbs.registerHelper('eq', (v1, v2) => v1 === v2);

// HANDLEBARS CONFIG 
app.engine('handlebars', engine({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    ifEquals: function (a, b, opts) {
      return a === b ? opts.fn(this) : opts.inverse(this);
    },
    eq: (a, b) => a === b,
    or: (a, b) => a || b,
    formatDate: (date) => {
      if (!date) return '';
      // Se for uma string apenas com YYYY-MM-DD, criar Date no fuso local
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [y, m, d] = date.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
      }
      // Caso contrário (Date object ou ISO datetime), usar o comportamento padrão
      return new Date(date).toLocaleDateString('pt-BR');
    },
    formatTime: (time) => {
      if (!time) return '';
      return time.slice(0, 5);
    },
    neq: (a, b) => a !== b
  }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'reservasutfpr_secret',
    resave: false,
    saveUninitialized: false
  })
);

// Disponibiliza usuário nas views automaticamente
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

// ROTAS DE AUTENTICAÇÃO SEMPRE PRIMEIRO
app.use('/', authRoutes);

// Depois rotas de cadastro/login de usuários
app.use('/usuarios', usuarioRoutes);

// Rota home
app.use('/', require('./routes/homeRoutes'));

// Demais rotas
app.use('/salas', salaRoutes);
app.use('/itens', itemRoutes);
app.use('/reservas', reservaRoutes);
app.use('/historico', historicoRoutes);
app.use('/avaliacoes', avaliacaoRoutes);
app.use('/perfil', perfilRoutes);

// BANCO E SERVIDOR
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ Banco sincronizado com sucesso!');

    // Função para tentar iniciar o servidor em uma porta, com retries em caso de porta em uso.
    const tryStartServer = (port, attemptsLeft) => {
      const server = app.listen(port, () => {
        console.log(`🚀 Servidor rodando: http://localhost:${port}`);
      });

      server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Porta ${port} está em uso.`);
          server.close && server.close();
          if (attemptsLeft > 0) {
            const nextPort = parseInt(port, 10) + 1;
            console.log(`Tentando porta ${nextPort} (tentativas restantes: ${attemptsLeft - 1})...`);
            // Pequeno atraso antes de tentar novamente para evitar tight-loop
            setTimeout(() => tryStartServer(nextPort, attemptsLeft - 1), 200);
          } else {
            console.error('Não foi possível encontrar uma porta livre. Encerre o processo que usa a porta desejada ou defina a variável PORT.');
            process.exit(1);
          }
        } else {
          console.error('Erro ao iniciar servidor:', err);
          process.exit(1);
        }
      });
    };

    const preferredPort = parseInt(process.env.PORT, 10) || 3000;
    tryStartServer(preferredPort, 10);
  })
  .catch(err => console.error('❌ Erro ao sincronizar banco:', err));
