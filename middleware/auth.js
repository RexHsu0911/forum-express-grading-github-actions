const { ensureAuthenticated, getUser } = require('../helpers/auth-helpers')

const authenticated = (req, res, next) => {
  // 等同於 if (req.isAuthenticated)
  // 使用者是否有登入
  if (ensureAuthenticated(req)) {
    return next()
  }
  // 沒登入的使用者會被導向登入頁面
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req)) {
    // 使用者是否有是 Admin
    if (getUser(req).isAdmin) return next()
    // 一般的使用者則會被丟回首頁
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
