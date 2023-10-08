'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Comment.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' })
      Comment.belongsTo(models.User, { foreignKey: 'userId' })
    }
  };
  Comment.init({
    text: DataTypes.STRING,
    userId: DataTypes.INTEGER, // 改成小駝峰式的命名
    restaurantId: DataTypes.INTEGER // 改成小駝峰式的命名
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments', // 設定 tableName
    underscored: true
  })
  return Comment
}
