const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    nome: { type: DataTypes.STRING, allowNull:false },
    registro: { type: DataTypes.STRING, allowNull:false, unique:true },
    email: { type: DataTypes.STRING, allowNull:false, unique:true },
    senha: { type: DataTypes.STRING, allowNull:false },
    tipo_usuario: { type: DataTypes.ENUM('ADMIN','USER'), allowNull:false, defaultValue:'USER' }
  }, { tableName: 'usuarios' });
  return Usuario;
};
