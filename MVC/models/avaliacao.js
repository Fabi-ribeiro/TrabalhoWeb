const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Avaliacao = sequelize.define(
    'Avaliacao',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_reserva: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'reservas', key: 'id' },
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      nota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      }
    },
    { 
      tableName: 'avaliacoes',
      timestamps: false,
    }
  );

  Avaliacao.associate = (models) => {
    Avaliacao.belongsTo(models.Reserva, { foreignKey: 'id_reserva' });
    Avaliacao.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
  };

  return Avaliacao;
};
