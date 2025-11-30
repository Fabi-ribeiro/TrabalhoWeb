const { Op } = require("sequelize");
const { Reserva, Sala, Item, Avaliacao } = require("../models");

exports.historico = async (req, res) => {
  try {
    const usuario = req.session.usuario; 
    if (!usuario) return res.redirect("/login");

    // Calcular data 'hoje' no fuso local (YYYY-MM-DD)
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const hoje = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

    // Buscar reservas cujo período já terminou (data_fim < hoje) ou que foram
    // canceladas/concluídas — assim o histórico mostra apenas reservas passadas.
    const reservas = await Reserva.findAll({
      where: {
        id_usuario: usuario.id,
        [Op.or]: [
          { data_fim: { [Op.lt]: hoje } }, // reservas cujo fim já passou
          { status: 'CANCELADA' },
          { status: 'CONCLUIDA' }
        ]
      },
      include: [
        { model: Sala, attributes: ['nome_sala'] },
        { model: Item, attributes: ['nome_item'] }
      ],
      order: [['data_fim', 'DESC']]
    });

    // Buscar avaliações já feitas pelo usuário
    const avaliacoes = await Avaliacao.findAll({
      where: { id_usuario: usuario.id }
    });

    // Marcar se cada reserva pode ser avaliada
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
};
