const { User, Restaurant, Like, Followship } = require('../../models')
const userServices = require('../../services/user-services')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功註冊帳號！')
      req.session.createdUser = data
      return res.redirect('/signin')
    })
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
    userServices.getUser(req, (err, data) => err ? next(err) : res.render('users/profile', data))
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
    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者資料編輯成功')
      req.session.editedUser = data
      return res.redirect(`/users/${req.params.id}`)
    })
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) => {
      if (err) return next(err)
      req.session.addFavorite = data
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) => {
      if (err) return next(err)
      req.session.removeFavorite = data
      return res.redirect('back')
    })
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
