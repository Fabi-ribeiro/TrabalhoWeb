const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Historico = sequelize.define('Historico', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    id_reserva: { type: DataTypes.INTEGER, allowNull:true },
    data_evento: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    acao: { type: DataTypes.STRING, allowNull:false },
    detalhe: { type: DataTypes.TEXT },
    id_usuario_actor: { type: DataTypes.INTEGER, allowNull:false }
  }, { tableName: 'historico', timestamps:false });
  return Historico;
};
