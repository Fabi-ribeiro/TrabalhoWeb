const { Item, Avaliacao, Usuario } = require('../models');

module.exports = class itemController {

  // LISTAR (com média de avaliações)
  static async listar(req, res) {
    try {
      const itensBD = await Item.findAll({ raw: true });
      const usuario = req.session.usuario;

      const itens = await Promise.all(itensBD.map(async item => {
        const avaliacoes = await Avaliacao.findAll({
          where: { id_item: item.id }
        });

        if (avaliacoes.length === 0) {
          item.avaliacao = null;
        } else {
          const soma = avaliacoes.reduce((acc, a) => acc + Number(a.nota), 0);
          item.avaliacao = (soma / avaliacoes.length).toFixed(1);
        }

        return item;
      }));

      res.render("itens/list", {
        layout: 'main',
        itens,
        usuario,
        isAdmin: usuario && (usuario.tipo_usuario === "ADMIN" || usuario.tipo_usuario === "ADM")
      });

    } catch (error) {
      console.error("Erro ao listar itens:", error);
      res.status(500).send("Erro ao listar itens: " + error.message);
    }
  }

  // Mostrar item com avaliações
  static async show(req, res) {
    try {
      const item = await Item.findByPk(req.params.id);

      if (!item) return res.redirect('/itens');

      const avaliacoes = await Avaliacao.findAll({
        where: { id_item: item.id },
        include: [{ model: Usuario, attributes: ['nome'] }],
        order: [['createdAt', 'DESC']]
      });

      res.render('itens/show', {
        layout: 'main',
        item: item.toJSON(),
        avaliacoes
      });

    } catch (error) {
      console.error("Erro ao carregar item:", error);
      res.status(500).send("Erro ao carregar item.");
    }
  }

  // Formulário de criação de item
  static async createForm(req, res) {
    try {
      const usuario = req.session.usuario;

      if (!usuario || (usuario.tipo_usuario !== 'ADMIN' && usuario.tipo_usuario !== 'ADM')) {
        return res.redirect('/home');
      }

      res.render('itens/create', {
        layout: 'main',
        usuario,
        isAdmin: true
      });
    } catch (error) {
      console.error('Erro ao carregar formulário de criação:', error);
      res.status(500).send('Erro ao carregar formulário de criação.');
    }
  }


  // Criar item
  static async createItem(req, res) {
    try {
      const { nome_item, quantidade_total, local, imagem } = req.body;

      await Item.create({
        nome_item,
        quantidade_total,
        local,
        imagem,
        avaliacao: null
      });

      res.redirect('/home');
    } catch (err) {
      console.error("Erro ao criar item:", err);
      res.status(500).send('Erro ao criar item.');
    }
  }

  // Formulário de edição de item
  static async editForm(req, res) {
    try {
      const id = req.params.id;
      const item = await Item.findByPk(id, { raw: true });
      if (!item) {
        return res.status(404).send('Item não encontrado');
      }

      res.render('itens/edit', {
        layout: 'main',
        item,
        usuario: req.session.usuario
      });
    } catch (error) {
      console.error('❌ Erro ao carregar formulário de edição de item:', error);
      res.status(500).send('Erro ao carregar edição de item.');
    }
  }

  // Atualizar item
  static async updateItem(req, res) {
    try {
      const id = req.params.id;
      const { nome_item, quantidade_total, local, imagem } = req.body;

      await Item.update(
        { nome_item, quantidade_total, local, imagem },
        { where: { id } }
      );

      res.redirect('/home');
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      res.status(500).send('Erro ao atualizar item.');
    }
  }

  // Excluir item
  static async deleteItem(req, res) {
    const usuario = req.session.usuario;
    if (!usuario || (usuario.tipo_usuario !== 'ADMIN' && usuario.tipo_usuario !== 'ADM')) {
      return res.redirect('/home');
    }

    const id = req.params.id;
    await Item.destroy({ where: { id } });
    res.redirect('/home');
  }
};
