// 等同於 const db = require('../models')
// const Restaurant = db.Restaurant
// 採用解構賦值的寫法
const { Restaurant, Category, User } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const adminServices = {
  getRestaurants: (req, cb) => {
    return Restaurant.findAll({
      // {raw: true} 把 Sequelize 包裝過的一大包物件轉換成格式比較單純的 JS 原生物件
      raw: true,
      nest: true, // {nest: true} 把資料整理成比較容易取用的結構
      include: [Category] // include 取得關聯資料 Category
    })
      .then(restaurants => {
        cb(null, { restaurants })
        // console.log('restaurants', restaurants)
      })
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    // 從 req.body 拿出表單裡(input 標籤的 name 屬性是 HTTP 傳輸時的資料名稱)的資料
    const { name, tel, address, openingHours, description, categoryId } = req.body
    // console.log(req.body)
    // 雖然在前端 HTML 標籤上已加上 required，但在後端拿到資料以後，還是要再做一次這個檢查，確保一定有拿到 name 這個資料，再存入資料庫
    // name 是必填，若發先是空值就會終止程式碼，並在畫面顯示錯誤提示
    if (!name) throw new Error('Restaurant name is required!')
    // 把檔案取出來，也可以寫成 const file = req.file
    const { file } = req
    // 把取出的檔案傳給 file-helper 處理後
    localFileHandler(file)
      // 產生一個新的 Restaurant 物件實例，並存入資料庫
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        // 如果 filePath 的值為檔案路徑字串 (使用者有上傳檔案，就會被判斷為 Truthy)，就將 image 的值設為檔案路徑，反之為 null
        image: filePath || null,
        categoryId // 提交該餐廳的 category 資訊
      }))
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    // req.params.id 則是對應到路由傳過來的參數(/:id)
    return Restaurant.findByPk(req.params.id, { // 去資料庫用 id 找一筆資料
      raw: true, // 找到以後整理格式再回傳
      nest: true, // {raw: true, est: true} 相等於 .toJSON()
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
        return cb(null, { restaurant })
      })
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
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
      .then(editedRestaurant => cb(null, { restaurant: editedRestaurant }))
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      })
      // 雖然目前後續不需要用到這筆資料，但我們預留了未來的可能性，前端有可能會想做一個「刪除成功」的彈跳視窗，讓使用者看見他刪除的資料
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  },
  getUsers: (req, cb) => {
    return User.findAll({
      raw: true
    })
      .then(users => cb(null, { users }))
      .catch(err => cb(err))
  },
  patchUser: (req, cb) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        // 使用者是否為 root(超級使用者)
        // console.log('email:', user.email)
        if (user.email === 'root@example.com') throw new Error('禁止變更 root 權限')
        return user.update({
          isAdmin: !user.isAdmin // 反值
        })
      })
      .then(patchedUser => cb(null, { user: patchedUser }))
      .catch(err => cb(err))
  }
}

module.exports = adminServices
