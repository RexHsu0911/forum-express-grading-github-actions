// 等同於 const db = require('../models')
// const Restaurant = db.Restaurant
// 採用解構賦值的寫法
const { Restaurant, Category } = require('../models')

const adminServices = {
  getRestaurants: (req, cb) => {
    return Restaurant.findAll({
      // {raw: true} 把 Sequelize 包裝過的一大包物件轉換成格式比較單純的 JS 原生物件
      raw: true,
      nest: true, // {nest: true} 把資料整理成比較容易取用的結構
      include: [Category] // include 取得關聯資料 Category
    })
      .then(restaurants => {
        cb(null, { restaurants })
        // console.log('restaurants', restaurants)
      })
      .catch(err => cb(err))
  }
}

module.exports = adminServices
