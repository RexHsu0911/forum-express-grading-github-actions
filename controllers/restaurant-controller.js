const { Restaurant, Category } = require('../models')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    // 當使用者點選的是「全部」這個頁籤時，categoryId 會是空值
    const categoryId = Number(req.query.categoryId) || '' // 從網址上查詢參數 categoryId 是字串，先轉成 Number 再操作
    return Promise.all([Restaurant.findAll({
      include: Category,
      where: { // 設定 where 查詢條件
        ...categoryId ? { categoryId } : {} // 檢查 categoryId 是否為空值
      },
      nest: true,
      raw: true
    }),
    Category.findAll({ raw: true }) // Category table 撈出全部的類別資料
    ])
      .then(([restaurants, categories]) => {
        // 使用展開運算子（spread operator） ...r，將 r 的物件拷貝並做出做局部修改，在展開之後會出現兩個重複的 description，但當 key 重複時，會被後面出現的取代
        const data = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50) // 將餐廳敘述文字（description）截為 50 個字
        }))
        // console.log(data)
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId
        })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return res.render('restaurant', { restaurant })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
