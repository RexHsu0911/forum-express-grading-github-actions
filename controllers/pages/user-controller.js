const bcrypt = require('bcryptjs')
const { User, Comment, Restaurant, Favorite, Like, Followship } = require('../../models')
const { localFileHandler } = require('../../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
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
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    // req.logout() 會把 user id 對應的 session 清除掉，對伺服器來說 session 消失就等於是把使用者登出了
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
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

        return res.render('users/profile', { user })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        return res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
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
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId
      }
    })
      .then(favorite => {
        // 是否存在收藏
        if (!favorite) throw new Error("You haven't favorited this restaurant!")

        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId), // 要收藏的這家餐廳是否存在？
      Like.findOne({ // 確認這個喜歡的關聯是否存在？
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        // 是否已存在喜歡
        if (like) throw new Error('You have liked this restaurant!')

        return Like.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    const { restaurantId } = req.params
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId
      }
    })
      .then(like => {
        // 是否存在喜歡
        if (!like) throw new Error("You haven't liked this restaurant!")

        return like.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        // 另外宣告變數 result，保留舊資料 users 以判斷資料加工有無差錯
        const result = users
          // 整理 users 資料，把每個 user 項目都拿出來處理一次，並把新陣列儲存在 users 裡
          .map(user => ({
            // 整理格式
            ...user.toJSON(),
            // 計算追蹤者人數
            followerCount: user.Followers.length,
            // 判斷目前登入使用者是否已追蹤該 user 的物件
            isFollowed: req.user && req.user.Followings.some(f => f.id === user.id)
          }))
          // 根據 followerCount 使用 sort 排序 user 由大排到小
          // 若(a > b)，回傳小於 0 的數字(相當於 b - a 為負數) -> 排序為[a, b]
          // 若(a < b) ，回傳大於 0 的數字(相當於 b - a 為正數) -> 排序為[b, a]
          // 若(a === b) ，回傳 0(相當於 b - a 為 0) -> 排序不動(預設)
          .sort((a, b) => b.followerCount - a.followerCount)

        res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const { userId } = req.params
    return Promise.all([
      User.findByPk(userId), // 要追蹤的這個使用者是否存
      Followship.findOne({ // 確認這個追蹤的關聯是否存在？
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error("User didn't exist!")
        // 是否已存在追蹤
        if (followship) throw new Error('You are already following this user!')

        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    const { userId } = req.params
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error("You haven't followed this user!")
        return followship.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController