// 把認證程序用 middleware 的方式加入路由
const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  // const authenticated = passport.authenticate('jwt', { session: false })
  // 原先寫法 無法客製錯誤訊息
  // authenticate 的第三參數可以接受 cb 函式(err, user)
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    // 正因為多了 callback，所以要自己處理驗證成功時 req.user 給資料的動作(將 user 資料存進去 req.user 中)，使得後續操作 req.user 資料
    req.user = user
    // console.log(user)
    next()
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  // console.log(req.user)
  if (req.user && req.user.isAdmin) return next()
  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
