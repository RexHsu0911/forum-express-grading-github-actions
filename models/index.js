'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
// path.resolve(__dirname) 用於將相對路徑轉換成絕對路徑。__dirname是目前檔案所在目錄的絕對路徑，path.resolve()方法將它與傳入的相對路徑拼接起來，並傳回一個完整的絕對路徑。
const config = require(path.resolve(__dirname, '../config/config.json'))[env]
const db = {}

// 資料庫連線
let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

// 動態引入其他 models
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

// 設定 Models 之間的關聯
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

// 匯出需要的物件
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
