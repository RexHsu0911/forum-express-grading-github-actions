'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  // 定義欄位
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // 設定 tableName
    // 把 lowerCamelCase 和 snack_case 的變數自動做雙向轉換，避開大小寫的問題(isAdmin => is_admin)
    underscored: true
  })
  return User
}
