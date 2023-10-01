const express = require('express')
const handlebars = require('express-handlebars')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', handlebars({ extname: '.hbs' }))
app.set('view engine', '.hbs')

// 當我們用 POST 動作來傳送資料時，來解析 request 的內容(Express 已內建 body-parser，直接引入使用)
app.use(express.urlencoded({ extended: true }))

app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
