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
        // console.log('restaurants', restaurants)
      })
      .catch(err => next(err))
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create-restaurant')
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body // 從 req.body 拿出表單裡(input 標籤的 name 屬性是 HTTP 傳輸時的資料名稱)的資料
    console.log(req.body)
    // 雖然在前端 HTML 標籤上已加上 required，但在後端拿到資料以後，還是要再做一次這個檢查，確保一定有拿到 name 這個資料，再存入資料庫
    if (!name) throw new Error('Restaurant name is required!') // name 是必填，若發先是空值就會終止程式碼，並在畫面顯示錯誤提示
    Restaurant.create({ // 產生一個新的 Restaurant 物件實例，並存入資料庫
      name,
      tel,
      address,
      openingHours,
      description
    })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created') // 在畫面顯示成功提示
        res.redirect('/admin/restaurants') // 新增完成後導回後台首頁
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
