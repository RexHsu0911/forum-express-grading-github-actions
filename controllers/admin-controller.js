// 等同於 const db = require('../models')
// const Restaurant = db.Restaurant
// 採用解構賦值的寫法
const { Restaurant, User, Category } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      // {raw: true} 把 Sequelize 包裝過的一大包物件轉換成格式比較單純的 JS 原生物件
      raw: true,
      nest: true, // {nest: true} 把資料整理成比較容易取用的結構
      include: [Category] // include 取得關聯資料 Category
    })
      .then(restaurants => {
        res.render('admin/restaurants', { restaurants })
        // console.log('restaurants', restaurants)
      })
      .catch(err => next(err))
  },
  createRestaurant: (req, res, next) => {
    // 去拿 Category table 裡面的所有資料，才有全部類別可以選
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body // 從 req.body 拿出表單裡(input 標籤的 name 屬性是 HTTP 傳輸時的資料名稱)的資料
    // console.log(req.body)
    // 雖然在前端 HTML 標籤上已加上 required，但在後端拿到資料以後，還是要再做一次這個檢查，確保一定有拿到 name 這個資料，再存入資料庫
    if (!name) throw new Error('Restaurant name is required!') // name 是必填，若發先是空值就會終止程式碼，並在畫面顯示錯誤提示
    const { file } = req // 把檔案取出來，也可以寫成 const file = req.file
    return localFileHandler(file) // 把取出的檔案傳給 file-helper 處理後
      .then(filePath => Restaurant.create({ // 產生一個新的 Restaurant 物件實例，並存入資料庫
        name,
        tel,
        address,
        openingHours,
        description,
        // 如果 filePath 的值為檔案路徑字串 (使用者有上傳檔案，就會被判斷為 Truthy)，就將 image 的值設為檔案路徑，反之為 null
        image: filePath || null,
        categoryId // 提交該餐廳的 category 資訊
      }))
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created') // 在畫面顯示成功提示
        res.redirect('/admin/restaurants') // 新增完成後導回後台首頁
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    // req.params.id 則是對應到路由傳過來的參數(/:id)
    return Restaurant.findByPk(req.params.id, { // 去資料庫用 id 找一筆資料
      raw: true, // 找到以後整理格式再回傳
      nest: true, // {raw: true, est: true} 相等於 .toJSON()
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    return Promise.all([ // 非同步處理
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    // 沒有設定 { raw: true } 來整理成乾淨的資料，是因為會把 sequelize 提供的 restaurant.update 這個方法過濾掉
    const { file } = req // 把檔案取出來
    return Promise.all([ // 非同步處理
      Restaurant.findByPk(req.params.id), // 去資料庫查有沒有這間餐廳
      localFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([restaurant, filePath]) => { // 以上兩樣事都做完以後
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          // 如果 filePath 是 Truthy (使用者有上傳新照片) 就用 filePath，是 Falsy (使用者沒有上傳新照片) 就沿用原本資料庫內的值
          image: filePath || restaurant.image,
          categoryId // 提交該餐廳的 category 資訊
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true
    })
      .then(users => {
        res.render('admin/users', { users })
      })
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        // 使用者是否為 root(超級使用者)
        // console.log('email:', user.email)
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }
        return user.update({
          isAdmin: !user.isAdmin // 反值
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        res.redirect('/admin/users')
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
