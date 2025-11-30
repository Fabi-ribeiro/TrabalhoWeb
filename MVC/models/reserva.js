const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reserva = sequelize.define(
    'Reserva',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      // estrutura de datas
      data_inicio: { type: DataTypes.DATEONLY, allowNull: false },
      data_fim: { type: DataTypes.DATEONLY, allowNull: false },

      // data_reserva fica como a data de solicitação
      data_reserva: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },

      hora_inicio: { type: DataTypes.TIME, allowNull: false },
      hora_fim: { type: DataTypes.TIME, allowNull: false },

      quantidade: { type: DataTypes.INTEGER, allowNull: true },
      finalidade: { type: DataTypes.STRING, allowNull: true },
      observacoes: { type: DataTypes.TEXT, allowNull: true },

      status: {
        type: DataTypes.ENUM('PENDENTE', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA'),
        defaultValue: 'PENDENTE',
      },

      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },

      id_sala: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'salas', key: 'id' },
      },

      id_item: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'itens', key: 'id' },
      },
    },
    { tableName: 'reservas' }
  );

  Reserva.associate = (models) => {
    Reserva.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'Usuario' });
    Reserva.belongsTo(models.Sala, { foreignKey: 'id_sala' });
    Reserva.belongsTo(models.Item, { foreignKey: 'id_item' });
  };

  return Reserva;
};
