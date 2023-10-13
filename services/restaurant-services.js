// 一般的 controller 和 API 的 controller 只是在回傳格式有差異，把「沒有差異」的部分抽取可以共用的 function 至 services 層
const { Restaurant, Category } = require('../models')
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
          description: r.description.substring(0, 50),
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
  }
}

module.exports = restaurantServices
