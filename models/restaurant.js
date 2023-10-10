'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // belongsTo 設定多對一關聯
      Restaurant.belongsTo(models.Category, { foreignKey: 'categoryId' })
      // hasMany 設定一對多關聯
      Restaurant.hasMany(models.Comment, { foreignKey: 'restaurantId' })
      // belongsToMany 設定多對多關聯
      Restaurant.belongsToMany(models.User, {
        through: models.Favorite, // 透過 Favorite 表來建立關聯
        foreignKey: 'restaurantId', // 對 Favorite 表設定 FK
        as: 'FavoritedUsers' // 幫這個關聯取個別名
      })
    }
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    openingHours: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING, // 新增欄位
    viewCounts: DataTypes.INTEGER // 新增欄位
  }, {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'Restaurants', // 設定 tableName
    underscored: true
  })
  return Restaurant
}
