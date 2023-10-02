// 等同於 const db = require('../models')
// const Restaurant = db.Restaurant
// 採用解構賦值的寫法
const { Restaurant } = require('../models')

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      // {raw: true} 把 Sequelize 包裝過的一大包物件轉換成格式比較單純的 JS 原生物件
      raw: true
    })
      .then(restaurants => {
        res.render('admin/restaurants', { restaurants })
        console.log('restaurants', restaurants)
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
