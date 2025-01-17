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
      User.hasMany(models.Comment, { foreignKey: 'userId' })
      User.belongsToMany(models.Restaurant, {
        through: models.Favorite,
        foreignKey: 'userId',
        as: 'FavoritedRestaurants'
      })
      User.belongsToMany(models.Restaurant, {
        through: models.Like,
        foreignKey: 'userId',
        as: 'LikedRestaurants'
      })
      // User 的追蹤者(找出哪些使用者在追蹤(followingId)這個使用者)
      User.belongsToMany(models.User, {
        through: models.Followship,
        foreignKey: 'followingId',
        as: 'Followers'
      })
      // User 追蹤中的 User(找出這個使用者追蹤了(followerId)哪些使用者)
      User.belongsToMany(models.User, {
        through: models.Followship,
        foreignKey: 'followerId',
        as: 'Followings'
      })
    }
  };
  // 定義欄位
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN, // 新增欄位
    image: DataTypes.STRING // 新增欄位
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // 設定 tableName
    // 把 lowerCamelCase 的變數自動轉換成 snack_case，避開大小寫的問題(isAdmin => is_admin)
    underscored: true
  })
  return User
}
