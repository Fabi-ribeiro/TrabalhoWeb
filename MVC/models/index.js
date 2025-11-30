// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

// Importando models com sequelize e DataTypes
const Usuario = require('./usuario')(sequelize, Sequelize.DataTypes);
const Sala = require('./sala')(sequelize, Sequelize.DataTypes);
const Item = require('./item')(sequelize, Sequelize.DataTypes);
const Reserva = require('./reserva')(sequelize, Sequelize.DataTypes);
const ItensReserva = require('./itensReserva')(sequelize, Sequelize.DataTypes);
const Historico = require('./historico')(sequelize, Sequelize.DataTypes);
const Avaliacao = require('./avaliacao')(sequelize, Sequelize.DataTypes);

// Associações
// Avaliacao ↔ Reserva
Reserva.hasMany(Avaliacao, { foreignKey: 'id_reserva', as: 'avaliacoes' });
Avaliacao.belongsTo(Reserva, { foreignKey: 'id_reserva', as: 'reserva' });

// Avaliacao ↔ Usuario
Usuario.hasMany(Avaliacao, { foreignKey: 'id_usuario', as: 'avaliacoes' });
Avaliacao.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Outras associações permanecem iguais
Usuario.hasMany(Reserva, { foreignKey: 'id_usuario' });
Reserva.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Sala.hasMany(Reserva, { foreignKey: 'id_sala' });
Reserva.belongsTo(Sala, { foreignKey: 'id_sala' });

Item.hasMany(Reserva, { foreignKey: 'id_item' });
Reserva.belongsTo(Item, { foreignKey: 'id_item' });

Reserva.hasMany(Historico, { foreignKey: 'id_reserva' });
Historico.belongsTo(Reserva, { foreignKey: 'id_reserva' });

Usuario.hasMany(Historico, { foreignKey: 'id_usuario_actor' });
Historico.belongsTo(Usuario, { foreignKey: 'id_usuario_actor' });

// Associação N:N: Reserva <-> Item através da tabela ItensReserva
Reserva.belongsToMany(Item, {
  through: ItensReserva,
  foreignKey: 'id_reserva',
  otherKey: 'id_item',
  as: 'itens'
});

Item.belongsToMany(Reserva, {
  through: ItensReserva,
  foreignKey: 'id_item',
  otherKey: 'id_reserva',
  as: 'reservas'
});

// Associação direta para a tabela de junção (útil para buscas diretas)
ItensReserva.belongsTo(Reserva, { foreignKey: 'id_reserva' });
ItensReserva.belongsTo(Item, { foreignKey: 'id_item' });

module.exports = { Usuario, Sala, Item, Reserva, ItensReserva, Historico, Avaliacao, sequelize};