const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Item = sequelize.define('Item', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome_item: { type: DataTypes.STRING, allowNull: false },
    quantidade_total: { type: DataTypes.INTEGER, allowNull: false },
    local: { type: DataTypes.STRING, allowNull: false },
    imagem: { type: DataTypes.TEXT, allowNull: true },
    avaliacao: { type: DataTypes.FLOAT, allowNull: true },
  }, {
    tableName: 'itens'
  });

  return Item;
};
