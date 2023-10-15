const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')

const admin = require('./modules/admin')

const restaurantController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

const { apiErrorHandler } = require('../../middleware/error-handler')

// admin
router.use('/admin', authenticated, authenticatedAdmin, admin)

// restaurants
router.get('/restaurants/top', authenticated, restaurantController.getTopRestaurants)
router.get('/restaurants/feeds', authenticated, restaurantController.getFeeds)
router.get('/restaurants/:id/dashboard', authenticated, restaurantController.getDashboard)
router.get('/restaurants/:id', authenticated, restaurantController.getRestaurant)
router.get('/restaurants', authenticated, restaurantController.getRestaurants)

// signup
router.post('/signup', userController.signUp)
// signin
// passport.authenticate() 指定了 Passport 的驗證策略
// 'local' 用帳號密碼來做驗證
// 設定關掉 sessions(不用 cookie-based 做驗證了，也就不需要 Passport 幫我們建立 session)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

// 設定錯誤處理的路由
router.use('/', apiErrorHandler)

module.exports = router
