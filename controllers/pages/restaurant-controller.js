const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurant', data))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        Comment,
        { model: User, as: 'FavoritedUsers' }
      ]
    // {nest: true, raw: true} 可能會破壞一對多關聯
    })
      .then(restaurant => {
        // console.log(restaurant.toJSON())
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        // order 寫成陣列可以指定使用多個排序條件，例如 order: [['createdAt', 'DESC'], ['id', 'ASC']]，當第一個條件相同時就會按照第二個條件來排
        order: [['createdAt', 'DESC']], // DESC (descending)降冪排序；而 ASC (ascending)升冪排序
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
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
