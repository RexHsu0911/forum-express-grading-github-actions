const express = require('express')
const router = express.Router()

const passport = require('../config/passport')

const admin = require('./modules/admin')

const restaurantController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const commentController = require('../controllers/comment-controller')

const upload = require('../middleware/multer')

// 把驗證程序 authenticatedAdmin 向上抽離到 routes/index.js
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

// admin
// 只要是 admin 相關的路由，都要經過 auth.js 這個 middleware 的權限檢查，通過才能往下走
router.use('/admin', authenticatedAdmin, admin)

// signup
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
// signin
router.get('/signin', userController.signInPage)
// 請 Passport 直接做身分驗證
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
// logout
router.get('/logout', userController.logout)
// users
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

// restaurants
// '/restaurants/feeds' 這組字串也符合動態路由 '/restaurants/:id' 的結構，會被視為「:id 是 feeds」而導向單一餐廳的頁面
// 若路由器先解析 /restaurants/:id，判定傳入的 :id 是 feeds，則會出現「找不到對應餐廳」的錯誤，所以要讓 /restaurants/feeds 先解析
router.get('/restaurants/feeds', authenticated, restaurantController.getFeeds)
router.get('/restaurants/:id/dashboard', authenticated, restaurantController.getDashboard)
router.get('/restaurants/:id', authenticated, restaurantController.getRestaurant)
router.get('/restaurants', authenticated, restaurantController.getRestaurants)

// comments
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)

// favorite
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

// 設定 fallback 路由，router.use 在任何HTTP請求方法（GET、POST、PUT等）都能執行
router.use('/', (req, res) => res.redirect('/restaurants'))

router.use('/', generalErrorHandler)

module.exports = router
