'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {

    }
  };
  Favorite.init({
    userId: DataTypes.INTEGER, // 改成小駝峰式的命名
    restaurantId: DataTypes.INTEGER // 改成小駝峰式的命名
  }, {
    sequelize,
    modelName: 'Favorite',
    tableName: 'Favorites', // 設定 tableName
    underscored: true
  })
  return Favorite
}
