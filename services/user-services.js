const { User, Comment, Restaurant, Favorite } = require('../models')
const bcrypt = require('bcryptjs')
const { localFileHandler } = require('../helpers/file-helpers')

const userServices = {
  signUp: (req, cb) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出(throw)
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出(throw)
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        // 透過 bcrypt 使用雜湊演算法，把使用者密碼轉成暗碼
        // return 讓這個 Promise resolve 的值可以傳到下一個 .then 裡面
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(newUser => cb(null, { user: newUser }))
      .catch(err => cb(err))
  },
  getUser: (req, cb) => {
    return User.findByPk(req.params.id, {
      include: [
        // 撈出所有 Comment 與 Restaurant 資料
        { model: Comment, include: Restaurant },
        // 撈出所有 Restaurant 與 Favorite 資料
        { model: Restaurant, as: 'FavoritedRestaurants' },
        // 撈出所有 User 與 Followers 資料
        { model: User, as: 'Followers' },
        // 撈出所有 User 與 Followings 資料
        { model: User, as: 'Followings' }
      ]
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        user = user.toJSON() // 簡化為 JSON 字串
        // console.log(user)

        // 陣列 commentedRestaurants 為使用者已評論的餐廳(不重複)
        // reduce 用於對陣列中的元素進行歸納、累加或轉換操作
        // reduce 方法接受兩個參數，第一個參數是一個函數，用來處理陣列中的每一個元素，第二個參數是初始值(累加器)，這裡設定為一個空陣列 []
        user.commentedRestaurants = user.Comments && user.Comments.reduce((acc, comment) => {
          // acc (accumulator)為累加器，它用來儲存最終的結果
          // 使用 some 方法檢查累加器中是否已經存在具有相同 restaurantId 的餐廳；如果不存在，則將該 Restaurant 添加 (push)到累加器中，並回傳更新後的累加器
          if (!acc.some(restaurant => restaurant.id === comment.restaurantId)) {
            acc.push(comment.Restaurant)
          }
          return acc
        }, [])

        return cb(null, { user })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const { name } = req.body
    // 判斷編輯使用者是否為自己的資料
    if (req.user.id !== Number(req.params.id)) throw new Error('只能更改自己的資料！')
    if (!name) throw new Error('User name is required!')

    const { file } = req // 把檔案取出來
    return Promise.all([
      User.findByPk(req.params.id),
      localFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User didn't exist!")

        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(editedUser => cb(null, { user: editedUser }))
      .catch(err => cb(err))
  },
  addFavorite: (req, cb) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId), // 要收藏的這家餐廳是否存在？
      Favorite.findOne({ // 確認這個收藏的關聯是否存在？
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        // 是否已存在收藏
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(addFavorite => cb(null, { favorite: addFavorite }))
      .catch(err => cb(err))
  }
}

module.exports = userServices
