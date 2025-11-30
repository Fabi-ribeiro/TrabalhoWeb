const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ItensReserva = sequelize.define('ItensReserva', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    id_reserva: { type: DataTypes.INTEGER, allowNull:false },
    id_item: { type: DataTypes.INTEGER, allowNull:false },
    quantidade_reservada: { type: DataTypes.INTEGER, allowNull:false }
  }, { tableName: 'itens_reserva' });
  return ItensReserva;
};
