const { Restaurant, Category } = require('../models')

const restaurantController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      include: Category,
      nest: true,
      raw: true
    }).then(restaurants => {
      // 使用展開運算子（spread operator） ...r，將 r 的物件拷貝並做出做局部修改，在展開之後會出現兩個重複的 description，但當 key 重複時，會被後面出現的取代
      const data = restaurants.map(r => ({
        ...r,
        description: r.description.substring(0, 50) // 將餐廳敘述文字（description）截為 50 個字
      }))
      // console.log(data)
      return res.render('restaurants', {
        restaurants: data
      })
    })
  }
}

module.exports = restaurantController
