const { Sala, Avaliacao, Usuario } = require('../models');

module.exports = {

  listar: async (req, res) => {
    try {
      const salas = await Sala.findAll();
      res.render('salas/list', { salas });
    } catch (error) {
      console.error('Erro ao listar salas:', error);
      res.status(500).send('Erro ao listar salas.');
    }
  },
  /* Mostrar sala com avaliações */
  show: async (req, res) => {
    try {
      const sala = await Sala.findByPk(req.params.id);

      if (!sala) return res.redirect('/home');

      const avaliacoes = await Avaliacao.findAll({
        where: { id_sala: sala.id },
        include: [{ model: Usuario, attributes: ['nome'] }],
        order: [['createdAt', 'DESC']]
      });

      res.render('salas/show', {
        sala: sala.toJSON(),
        avaliacoes
      });

    } catch (error) {
      console.error("Erro ao carregar sala:", error);
      res.status(500).send("Erro ao carregar sala.");
    }
  },

  createForm: (req, res) => res.render('salas/create'),

  create: async (req, res) => {
    try {
      await Sala.create({
        nome_sala: req.body.nome_sala,
        capacidade: req.body.capacidade,
        descricao: req.body.descricao,
        is_reservada: false
      });

      res.redirect('/home');
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      res.render('salas/create', { error: 'Erro ao criar sala.' });
    }
  },

  editForm: async (req, res) => {
    const sala = await Sala.findByPk(req.params.id);
    res.render('salas/edit', { sala });
  },

  update: async (req, res) => {
    const sala = await Sala.findByPk(req.params.id);

    sala.nome_sala = req.body.nome_sala;
    sala.capacidade = req.body.capacidade;
    sala.descricao = req.body.descricao;

    await sala.save();
    res.redirect('/home');
  },

  delete: async (req, res) => {
    const sala = await Sala.findByPk(req.params.id);
    await sala.destroy();
    res.redirect('/home');
  }
};
