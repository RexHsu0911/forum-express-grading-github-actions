const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { User, Restaurant } = require('../models')

// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    // 把 callback 的第一個參數拿到 req 裡，這麼一來我們就可以呼叫 req.flash() 把想要客製化的訊息放進去
    passReqToCallback: true
  },
  // authenticate user 的 callback function
  // cb 為驗證後要執行的 callback function
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        // user(email) 不存在
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        // user 存在，驗證密碼
        bcrypt.compare(password, user.password)
          .then(res => {
            // 密碼不一致
            if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
            return cb(null, user)
          })
      })
  }
))
// 序列化 serialize(只存 user id) and 反序列化 deserialize user(透過 user id，把整個 user 物件實例拿出來)
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' }, // 在 include 的時候有追加 as 來標明我們想要引入的關係(從使用者資料中取出其收藏的餐廳)
      { model: Restaurant, as: 'LikedRestaurants' }, // 從使用者資料中取出其喜歡的餐廳
      { model: User, as: 'Followers' }, // 取出 User 的追蹤者
      { model: User, as: 'Followings' } // 取出 User 追蹤中的 User
    ]
  })
    // toJSON() 將 Sequelize 打包後的物件(可以直接透過 Sequelize 操作這筆資料)，簡化為 JSON 字串
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport
