const express = require('express')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const routes = require('./routes')
const passport = require('./config/passport')

const app = express()
const port = process.env.PORT || 3000

const SESSION_SECRET = 'secret'

app.engine('hbs', handlebars({ extname: '.hbs' }))
app.set('view engine', '.hbs')

// 當我們用 POST 動作來傳送資料時，來解析 request 的內容(Express 已內建 body-parser，直接引入使用)
app.use(express.urlencoded({ extended: true }))

// secret 為 session 用來驗證 session id 的字串(保護 session 放到瀏覽器的 cookie 後不會被篡改與偽造)
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
// 設定 flash message
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
