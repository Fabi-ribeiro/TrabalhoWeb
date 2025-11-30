const { Sala, Item, Reserva, Avaliacao, Usuario } = require('../models');
const reservaController = require('./reservaController');
const { Op } = require('sequelize');

module.exports = {
  home: async (req, res) => {
    try {
      // Atualiza reservas expiradas para PENDENTE 
      await reservaController.updateExpiredReservations();
      const usuario = req.session.usuario;
      const termo = req.query.q ? req.query.q.toLowerCase() : '';
      const filtro = (req.query.filtro || 'todos').toLowerCase();
      const hoje = new Date().toISOString().split('T')[0];

      // Buscar salas + reservas + avaliações
      let salas = await Sala.findAll({
        include: [
          {
            model: Reserva,
            include: [{ model: Avaliacao, as: 'avaliacoes' }]
          }
        ]
      });

      // Buscar itens + reservas + avaliações
      let itens = await Item.findAll({
        include: [
          {
            model: Reserva,
            include: [{ model: Avaliacao, as: 'avaliacoes' }]
          }
        ]
      });

      // Calcular média e quantidade de avaliações para salas
      salas = salas.map(s => {
        const avaliacoes = s.Reservas.flatMap(r => r.avaliacoes || []);
        const notasValidas = avaliacoes.filter(a => a && typeof a.nota === "number");
        let media = null;
        if (notasValidas.length > 0) {
          media = notasValidas.reduce((acc, a) => acc + a.nota, 0) / notasValidas.length;
          media = Number(media.toFixed(1));
        }
        return {
          ...s.get({ plain: true }),
          avaliacao_media: media,
          avaliacao_qtd: notasValidas.length
        };
      });

      // Calcular média e quantidade de avaliações para itens
      itens = itens.map(i => {
        const avaliacoes = i.Reservas.flatMap(r => r.avaliacoes || []);
        const notasValidas = avaliacoes.filter(a => a && typeof a.nota === "number");
        let media = null;
        if (notasValidas.length > 0) {
          media = notasValidas.reduce((acc, a) => acc + a.nota, 0) / notasValidas.length;
          media = Number(media.toFixed(1));
        }
        return {
          ...i.get({ plain: true }),
          avaliacao_media: media,
          avaliacao_qtd: notasValidas.length
        };
      });

      // Marcar salas como indisponíveis ou pendentes dependendo do status da reserva
      for (let sala of salas) {
        // Checar se há reserva PENDENTE 
        const reservaPendente = await Reserva.findOne({
          where: { id_sala: sala.id, status: 'PENDENTE' }
        });
        if (reservaPendente) {
          sala.pendente_sala = true;
          sala.indisponivel_sala = true; // bloqueia reserva até verificação
          continue;
        }

        // Caso não haja pendente, checa por reservas confirmadas
        const reservaConfirmada = await Reserva.findOne({
          where: { id_sala: sala.id, status: 'CONFIRMADA' }
        });
        sala.indisponivel_sala = !!reservaConfirmada;
        sala.pendente_sala = false;
      }

      // Marcar itens como indisponíveis ou pendentes
      for (let item of itens) {
        const reservaPendenteItem = await Reserva.findOne({
          where: { id_item: item.id, status: 'PENDENTE' }
        });
        if (reservaPendenteItem) {
          item.pendente_item = true;
          item.indisponivel_item = true;
          continue;
        }

        // Considera o item indisponível apenas quando não houver estoque (quantidade_total === 0).
        item.indisponivel_item = item.quantidade_total === 0;
        item.pendente_item = false;
      }

      // Filtro de busca
      if (termo) {
        salas = salas.filter(s => s.nome_sala.toLowerCase().includes(termo));
        itens = itens.filter(i => i.nome_item.toLowerCase().includes(termo));
      }

      // Filtro por botão
      if (filtro === 'salas') itens = [];
      if (filtro === 'itens') salas = [];

      // Unificar em lista para a view
      const recursos = [
        ...salas.map(s => ({ ...s, tipo: 'Sala' })),
        ...itens.map(i => ({ ...i, tipo: 'Item' }))
      ];

      res.render('home/home', {
        usuario,
        recursos,
        q: req.query.q || '',
        filtro,
        isAdmin: usuario?.tipo_usuario === 'ADMIN'
      });

    } catch (error) {
      console.error('Erro ao carregar home:', error);
      res.status(500).send('Erro ao carregar a página inicial.');
    }
  }
};
