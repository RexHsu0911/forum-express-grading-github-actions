// 呼叫取用 dotenv 設定檔
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

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

// 對於 GET 或 DELETE 動作的參數通常附加在 URL 的查詢字符串中，不需要解析 req.body 內容
// 當我們用 POST 動作於表單(form)來傳送資料時，來解析 URL-encoded 格式(字串或陣列)的請求物件
// body-parser 解析不同格式的資料，並且把資料放進 req.body(Express 已內建 body-parser，直接引入使用)
app.use(express.urlencoded({ extended: true }))
// 啟用 Express 的 JSON 功能，解析 JSON 格式的請求物件
app.use(express.json())

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
