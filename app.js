// path 套件跟 fs 一樣都是 node.js 的原生模組，在處理跟檔案有關的事情
const path = require('path')

const express = require('express')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('./config/passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')

const { pages, apis } = require('./routes')

const app = express()
const port = process.env.PORT || 3000

const SESSION_SECRET = 'secret'

// 註冊 handlebars-helpers
app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', '.hbs')

// 當我們用 POST 動作來傳送資料時，來解析 request 的內容(Express 已內建 body-parser，直接引入使用)
app.use(express.urlencoded({ extended: true }))

// secret 為 session 用來驗證 session id 的字串(保護 session 放到瀏覽器的 cookie 後不會被篡改與偽造)
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
// 在 HTML 的 <form> 裡面，action 這個屬性只能夠填 GET 與 POST，並不支援 PUT 跟 DELETE
// 支援 PUT 跟 DELETE 需要把 form 的 action 填 POST，並在網址後面加上 _method=PUT 或 DELETE
app.use(methodOverride('_method'))
// 設定 express.static 靜態檔案路徑 /upload
app.use('/upload', express.static(path.join(__dirname, 'upload')))

// 設定 flash message
app.use((req, res, next) => {
  // 把變數設放到 res.locals 裡，讓所有的 view 都能存取
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.loginUser = getUser(req)
  next()
})

// 路徑多了 api 字串要比對，需要在 app.use(pages) 的前面
app.use('/api', apis)
app.use(pages)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
