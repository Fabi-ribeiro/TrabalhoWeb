const { Op } = require("sequelize");
const { Reserva, Sala, Item, Avaliacao } = require("../models");

module.exports = {
  /*
    Atualizar reserva que já terminou: se ainda estiverem como
    CONFIRMADA, trocamos para PENDENTE para que o admin verifique devolução
    / liberação. 
  */
  updateExpiredReservations: async () => {
    try {
      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const hoje = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

      // Atualiza apenas reservas que terminaram (data_fim < hoje) e ainda estão CONFIRMADA
      const [count] = await Reserva.update(
        { status: 'PENDENTE' },
        {
          where: {
            data_fim: { [Op.lt]: hoje },
            status: 'CONFIRMADA'
          }
        }
      );

      if (count > 0) console.log(`✅ Atualizadas ${count} reserva(s) expiradas para PENDENTE`);
    } catch (err) {
      console.error('Erro ao atualizar reservas expiradas:', err);
    }
  },
  /* Listar reservas do usuário */
  list: async (req, res) => {
    try {
      // Atualiza reservas expiradas antes de listar
      await module.exports.updateExpiredReservations();

      const usuario = req.session.usuario;
  // Calcular a data "hoje" no fuso local no formato YYYY-MM-DD
  const tzOffset = new Date().getTimezoneOffset() * 60000; // em ms
  const hoje = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

      const where = {};

      // Reservas a partir de hoje (usando data_inicio como referência)
      where.data_inicio = { [Op.gte]: hoje };

      if (usuario.tipo_usuario !== "ADMIN") {
        where.id_usuario = usuario.id;
      }

      const reservas = await Reserva.findAll({
        where,
        include: [
          { model: Sala, attributes: ["id", "nome_sala"], required: false },
          { model: Item, attributes: ["id", "nome_item"], required: false }
        ],
        order: [
          ["data_inicio", "ASC"],
          ["hora_inicio", "ASC"]
        ]
      });

      res.render("reservas/list", { reservas, usuario });

    } catch (error) {
      console.error("Erro ao carregar minhas reservas:", error);
      res.status(500).send("Erro ao carregar minhas reservas.");
    }
  },

  /* Histórico de reserva */
  historico: async (req, res) => {
    try {
      // Atualiza reservas expiradas antes de mostrar histórico
      await module.exports.updateExpiredReservations();

      const usuario = req.session.usuario;
      if (!usuario) return res.redirect("/login");

      const hoje = new Date().toISOString().split("T")[0];

      const reservas = await Reserva.findAll({
        where: {
          id_usuario: usuario.id,
          [Op.or]: [
            { data_fim: { [Op.lt]: hoje } },
            { status: "CANCELADA" },
            { status: "CONCLUIDA" }
          ]
        },
        include: [
          { model: Sala, attributes: ["nome_sala"] },
          { model: Item, attributes: ["nome_item"] }
        ],
        order: [["data_inicio", "DESC"]]
      });

      const avaliacoes = await Avaliacao.findAll({
        where: { id_usuario: usuario.id }
      });

      const reservasComAval = reservas.map(reserva => {
        const jaAvaliou = avaliacoes.some(a => a.id_reserva === reserva.id);
        return {
          ...reserva.toJSON(),
          podeAvaliar: reserva.status === "CONCLUIDA" && !jaAvaliou
        };
      });

      res.render("historico/list", { reservas: reservasComAval, usuario });

    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao carregar histórico.");
    }
  },

  /* Listar reservas pendentes - admin */
  pendentes: async (req, res) => {
    try {
      // Garantir que reservas que venceram recentemente apareçam como PENDENTE
      await module.exports.updateExpiredReservations();
      const reservas = await Reserva.findAll({
        where: { status: "PENDENTE" },
        include: [
          { model: Sala, attributes: ["nome_sala"] },
          { model: Item, attributes: ["nome_item", "quantidade_total"] }
        ],
        order: [["data_inicio", "ASC"]]
      });

      res.render("reservas/pendentes", { reservas });

    } catch (err) {
      console.error(err);
      res.status(500).send("Erro ao listar reservas pendentes.");
    }
  },

  verificarForm: async (req, res) => {
    const reserva = await Reserva.findByPk(req.params.id, {
      include: [
        { model: Sala, attributes: ["nome_sala"] },
        { model: Item, attributes: ["nome_item", "quantidade_total"] }
      ]
    });

    if (!reserva) return res.redirect("/reservas/pendentes");

    res.render("reservas/verificar", { reserva });
  },

  confirmarVerificacao: async (req, res) => {
    try {
      const reserva = await Reserva.findByPk(req.params.id);

      if (!reserva) return res.redirect("/reservas/pendentes");

      if (reserva.id_item) {
        const { quantidade_devolvida } = req.body;
        const item = await Item.findByPk(reserva.id_item);
        item.quantidade_total += parseInt(quantidade_devolvida, 10);
        await item.save();
      }

      if (reserva.id_sala) {
        const { sala_liberada } = req.body;
        if (sala_liberada === "on") {
          const sala = await Sala.findByPk(reserva.id_sala);
          sala.is_reservada = false;
          await sala.save();
        }
      }

      reserva.status = "CONCLUIDA";
      await reserva.save();

      req.session.flash = { tipo: "success", mensagem: "Reserva finalizada!" };
      res.redirect("/reservas/pendentes");

    } catch (err) {
      console.error(err);
      req.session.flash = { tipo: "error", mensagem: "Erro ao finalizar reserva." };
      res.redirect("/reservas/pendentes");
    }
  },

  /* Formulário de reserva por item */
  createFromItemPage: async (req, res) => {
    try {
      const item = await Item.findByPk(req.params.id, { raw: true });
      if (!item) return res.status(404).send("Item não encontrado");
  
      res.render("reservas/create", { item, usuario: req.session.usuario, reservaId: req.query.reserva });

    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao carregar formulário.");
    }
  },

  /* Criar reserva de item */
  createFromItem: async (req, res) => {
    try {
      const usuario = req.session.usuario;
      const { item_id, data_inicio, data_fim, hora_inicio, hora_fim, finalidade, observacoes, quantidade } = req.body;

      const item = await Item.findByPk(item_id);
      if (!item) return res.redirect("/home");

      const qtd = parseInt(quantidade, 10);
      if (qtd > item.quantidade_total) return res.redirect("/home");

      await Reserva.create({
        id_item: item.id,
        id_usuario: usuario.id,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
        finalidade,
        observacoes,
        quantidade: qtd,
        status: "CONFIRMADA"
      });

      item.quantidade_total -= qtd;
      await item.save();

      res.redirect("/home");

    } catch (error) {
      console.error(error);
      res.redirect("/home");
    }
  },

  /* Formulário de reserva por sala */
  createFromSalaPage: async (req, res) => {
    try {
      const sala = await Sala.findByPk(req.params.id, { raw: true });
      if (!sala) return res.redirect("/home");

      res.render("reservas/create", { sala, usuario: req.session.usuario, reservaId: req.query.reserva });

    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao carregar formulário.");
    }
  },

  /* Criar reserva de sala */
  createFromSala: async (req, res) => {
    try {
      const usuario = req.session.usuario;
      const sala = await Sala.findByPk(req.params.id);
      if (!sala) return res.redirect("/home");

      const { data_inicio, data_fim, hora_inicio, hora_fim, finalidade, observacoes } = req.body;

      const conflito = await Reserva.findOne({
        where: {
          id_sala: sala.id,
          data_inicio: { [Op.lte]: data_fim },
          data_fim: { [Op.gte]: data_inicio },
          status: "CONFIRMADA",
          [Op.and]: [
            { hora_inicio: { [Op.lt]: hora_fim } },
            { hora_fim: { [Op.gt]: hora_inicio } }
          ]
        }
      });

      if (conflito) {
        return res.render("reservas/create", {
          sala: sala.toJSON(),
          usuario,
          error: "A sala já está reservada neste período."
        });
      }

      await Reserva.create({
        id_sala: sala.id,
        id_usuario: usuario.id,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
        finalidade,
        observacoes,
        quantidade: 1,
        status: "CONFIRMADA"
      });

      sala.is_reservada = true;
      await sala.save();

      res.redirect("/home");

    } catch (error) {
      console.error(error);
      res.redirect("/home");
    }
  },

  cancelar: async (req, res) => {
    try {
      const usuario = req.session.usuario;
      const reserva = await Reserva.findByPk(req.params.id);
      if (!reserva) return res.redirect("/reservas/list");

      if (reserva.id_usuario !== usuario.id && usuario.tipo_usuario !== "ADMIN") {
        return res.status(403).send("Acesso negado");
      }

      reserva.status = "CANCELADA";
      await reserva.save();

      if (reserva.id_item) {
        const item = await Item.findByPk(reserva.id_item);
        if (item) {
          item.quantidade_total += reserva.quantidade;
          await item.save();
        }
      }

      if (reserva.id_sala) {
        const sala = await Sala.findByPk(reserva.id_sala);
        if (sala) {
          sala.is_reservada = false;
          await sala.save();
        }
      }

      res.redirect("/reservas/list");

    } catch (error) {
      console.error(error);
      res.redirect("/reservas/list");
    }
  },

  confirmar: async (req, res) => {
    try {
      const reserva = await Reserva.findByPk(req.params.id);
      if (!reserva) return res.redirect("/reservas/list");

      reserva.status = "CONFIRMADA";
      await reserva.save();

      if (reserva.id_sala) {
        const sala = await Sala.findByPk(reserva.id_sala);
        sala.is_reservada = true;
        await sala.save();
      }

      res.redirect("/reservas/list");

    } catch (error) {
      console.error(error);
      res.redirect("/reservas/list");
    }
  }
};
