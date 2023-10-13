const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      // 預先加載 eager loading
      // 項目變多時，需要改成用陣列
      include: [
        Category,
        { model: Comment, include: User }, // 要拿到 Restaurant 關聯的 Comment，再拿到 Comment 關聯的 User，要做兩次的查詢
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ],
      order: [
        [Comment, 'createdAt', 'DESC'] // 依 Comment 建立時間降冪排序(DESC)
      ]
    })
      .then(restaurant => {
        // console.log(restaurant.Comments[0].dataValues)
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        // console.log(restaurant.toJSON())
        // restaurant.increment 更新 viewCounts 的數值(+1)
        return restaurant.increment('viewCounts')
      })
      .then(restaurant => {
        // 處理單一餐廳時，檢查「現在的使用者」是否有出現在「這間餐廳的收藏使用者列表」裡面
        // 使用 some 的好處是只要帶迭代過程中找到一個符合條件的項目後(若使用者 id 相符)，就會立刻回傳 true，後面的項目不會繼續執行
        // 比起 map 方法無論如何都會從頭到尾把陣列裡的項目執行一次，可以有效減少執行次數
        const isFavorited = restaurant.FavoritedUsers.some(fu => fu.id === req.user.id)

        // 處理單一餐廳時，檢查「現在的使用者」是否有出現在「這間餐廳的喜歡使用者列表」裡面
        const isLiked = restaurant.LikedUsers.some(lu => lu.id === req.user.id)

        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => next(err))
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
