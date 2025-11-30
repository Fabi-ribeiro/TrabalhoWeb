const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sala = sequelize.define('Sala', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    is_reservada: { 
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: false 
    },
    nome_sala: { type: DataTypes.STRING, allowNull:false },
    capacidade: { type: DataTypes.INTEGER, allowNull:false },
    localizacao: { type: DataTypes.STRING, allowNull:true },
    imagem: { type: DataTypes.TEXT, allowNull:true },
    descricao: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: 'salas', timestamps: true });

  Sala.associate = (models) => {
    Sala.hasMany(models.Reserva, { foreignKey: 'id_sala', as: 'reservas' });
  };

  return Sala;
};
