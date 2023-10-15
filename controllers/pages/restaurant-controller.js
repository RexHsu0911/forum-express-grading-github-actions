const { Restaurant, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurant', data))
  },
  getDashboard: (req, res, next) => {
    restaurantServices.getDashboard(req, (err, data) => err ? next(err) : res.render('dashboard', data))
  },
  getFeeds: (req, res, next) => {
    restaurantServices.getFeeds(req, (err, data) => err ? next(err) : res.render('feeds', data))
  },
  getTopRestaurants: (req, res, next) => {
  // 撈出所有 Restaurant 與 favorite 資料
    return Restaurant.findAll({
      include: [{
        model: User, as: 'FavoritedUsers'
      }]
    })
      .then(restaurants => {
      // console.log(restaurants)
      // 整理 restaurants 資料，把每個 restaurant 項目都拿出來處理一次，並把新陣列儲存在 restaurants 裡
        const result = restaurants
          .map(restaurant => ({
          // 整理格式
            ...restaurant.toJSON(),
            // 將餐廳敘述文字（description）截為 50 個字
            description: restaurant.description.substring(0, 50),
            // 計算收藏者人數
            favoritedCount: restaurant.FavoritedUsers.length,
            // 判斷目前登入使用者是否已收藏該 user 的物件
            isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === restaurant.id)
          }))
        // 根據 favoritedCount 使用 sort 排序 restaurant 由大排到小
        // 用 slice(0, 10) 回傳一個新陣列，取前 10 筆資料
          .sort((a, b) => b.favoritedCount - a.favoritedCount).slice(0, 10)

        res.render('top-restaurants', { restaurants: result })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
