// 一般的 controller 和 API 的 controller 只是在回傳格式有差異，把「沒有差異」的部分抽取可以共用的 function 至 services 層
const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantServices = {
  // 追加一個參數 callback function(簡稱 cb)
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    // 從網址上查詢參數 categoryId 是字串，先轉成 Number 再操作
    // 當使用者點選的是「全部」這個頁籤時，categoryId 會是空值
    const categoryId = Number(req.query.categoryId) || ''
    // 從 query string 取得 page & limit
    // 當使用者點擊 pagination 上的任一按鈕時，我們會根據他點擊的按鈕，把資訊放進網址的 query string
    // 例如 /restaurants?page=2，在 controller 裡就會把 2 取出來
    // 在 limit 的部分，雖然剛剛已經決定好 DEFAULT_LIMIT，也可以多加上讓使用者選擇「每頁顯示 N 筆」的功能(待優化)
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    // findAndCountAll 方法來知道撈回來的餐廳資料一共有幾筆
    return Promise.all([Restaurant.findAndCountAll({
      include: Category,
      where: { // 設定 where 查詢條件
        ...categoryId ? { categoryId } : {} // 檢查 categoryId 是否為空值
      },
      limit,
      offset,
      nest: true,
      raw: true
    }),
    Category.findAll({ raw: true }) // Category table 撈出全部的類別資料
    ])
      .then(([restaurants, categories]) => {
        if (!restaurants) {
          const err = new Error("Restaurants didn't exist!")
          err.status = 404
          throw err
        }
        if (!categories) {
          const err = new Error("Categories didn't exist!")
          err.status = 404
          throw err
        }
        // 在輸出餐廳列表時，「現在這間餐廳」是否有出現在「使用者的收藏清單」裡面
        // 可選串連運算子?.
        // req.user?.FavoritedRestaurants 判斷 req.user 是否存在，不存在的話，會回傳 undefined
        // 取出使用者的收藏清單 map 成 id 清單
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
        const data = restaurants.rows.map(r => ({
          // 使用展開運算子（spread operator） ...r，將 r 的物件拷貝並做出做局部修改，在展開之後會出現兩個重複的 description，但當 key 重複時，會被後面出現的取代
          ...r,
          // 將餐廳敘述文字（description）截為 50 個字
          description: r.description?.substring(0, 50),
          // includes 方法進行比對 restaurants.id 是否有被使用者收藏，最後會回傳布林值
          isFavorited: favoritedRestaurantsId.includes(r.id),
          // 比對 restaurants.id 是否有被使用者喜歡
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        // callback 的第一個參數按照慣例會處理錯誤的情況，這裡我們傳入 null，第二個參數則會傳入上面這段程式運行後的結果，也就是整理後的資料(data)
        return cb(null, {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count) // 把 pagination 資料傳回樣板
        })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
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
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist!")
          err.status = 404
          throw err
        }

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

        return cb(null, {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => cb(err))
  },
  getDashboard: (req, cb) => {
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
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist!")
          err.status = 404
          throw err
        }
        return cb(null, { restaurant: restaurant.toJSON() })
      })
      .catch(err => cb(err))
  },
  getFeeds: (req, cb) => {
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
        if (!restaurants) {
          const err = new Error("Restaurants didn't exist!")
          err.status = 404
          throw err
        }
        if (!comments) {
          const err = new Error("Comments didn't exist!")
          err.status = 404
          throw err
        }
        cb(null, { restaurants, comments })
      })
      .catch(err => cb(err))
  },
  getTopRestaurants: (req, cb) => {
    // 撈出所有 Restaurant 與 favorite 資料
    return Restaurant.findAll({
      include: [{
        model: User, as: 'FavoritedUsers'
      }]
    })
      .then(restaurants => {
        if (!restaurants) {
          const err = new Error("Restaurants didn't exist!")
          err.status = 404
          throw err
        }
        // console.log(restaurants)
        // 整理 restaurants 資料，把每個 restaurant 項目都拿出來處理一次，並把新陣列儲存在 restaurants 裡
        const result = restaurants
          .map(restaurant => ({
            // 整理格式
            ...restaurant.toJSON(),
            // 將餐廳敘述文字（description）截為 50 個字
            description: restaurant.description?.substring(0, 50),
            // 計算收藏者人數
            favoritedCount: restaurant.FavoritedUsers.length,
            // 判斷目前登入使用者是否已收藏該 user 的物件
            isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === restaurant.id)
          }))
          // 根據 favoritedCount 使用 sort 排序 restaurant 由大排到小
          // 用 slice(0, 10) 回傳一個新陣列，取前 10 筆資料
          .sort((a, b) => b.favoritedCount - a.favoritedCount).slice(0, 10)

        return cb(null, { restaurants: result })
      })
      .catch(err => cb(err))
  }
}

module.exports = restaurantServices
