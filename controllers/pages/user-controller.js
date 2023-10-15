const { User, Followship } = require('../../models')
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
    userServices.addLike(req, (err, data) => {
      if (err) return next(err)
      req.session.addLike = data
      return res.redirect('back')
    })
  },
  removeLike: (req, res, next) => {
    userServices.removeLike(req, (err, data) => {
      if (err) return next(err)
      req.session.removeLike = data
      return res.redirect('back')
    })
  },
  getTopUsers: (req, res, next) => {
    userServices.removeLike(req, (err, data) => {
      if (err) return next(err)
      return res.render('top-users', data)
    })
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
