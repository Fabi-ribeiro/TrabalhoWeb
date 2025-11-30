const { Avaliacao, Reserva, Usuario } = require("../models");

module.exports = {
  listar: async (req, res) => {
    try {
      const avaliacoes = await Avaliacao.findAll({
        include: [
          {
            model: Reserva,
            as: "Reserva",
            include: [
              { model: Usuario, as: "Usuario" }
            ]
          }
        ],
        order: [["id", "DESC"]]
      });

      res.render("avaliacoes/list", { avaliacoes });
    } catch (error) {
      console.error("Erro ao listar avaliações:", error);
      res.status(500).send("Erro ao listar avaliações.");
    }
  },

  criarForm: async (req, res) => {
    try {
      const usuarioLogado = req.session.usuario.id;

      const reservaId = req.query.reserva_id || req.query.reserva;

      // Se não tem reserva, redirecionar para o histórico
      if (!reservaId) return res.redirect('/historico');

      const selectedReserva = await Reserva.findOne({
        where: { id: reservaId, id_usuario: usuarioLogado },
        include: [
          { model: Usuario, as: 'Usuario' },
          { model: require('../models').Sala, as: 'Sala' },
          { model: require('../models').Item, as: 'Item' }
        ]
      });

      if (!selectedReserva) return res.status(403).send('Reserva não encontrada ou não pertence ao usuário.');

      res.render("avaliacoes/create", { selectedReserva });
    } catch (error) {
      console.error("Erro ao carregar formulário:", error);
      res.status(500).send("Erro ao carregar formulário.");
    }
  },

  criar: async (req, res) => {
    try {
      const { id_reserva, nota } = req.body;
      const usuarioLogado = req.session.usuario.id;

      const reserva = await Reserva.findOne({
        where: { id: id_reserva, id_usuario: usuarioLogado }
      });

      if (!reserva)
        return res.status(403).send("Não autorizado para avaliar esta reserva!");

      await Avaliacao.create({ id_reserva, id_usuario: usuarioLogado, nota });
      
      res.redirect("/historico");
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
      res.status(500).send("Erro ao criar avaliação.");
    }
  }
};
