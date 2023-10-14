const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')

const admin = require('./modules/admin')

const restaurantController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

const { apiErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', authenticated, authenticatedAdmin, admin)

router.get('/restaurants', authenticated, restaurantController.getRestaurants)

// passport.authenticate() 指定了 Passport 的驗證策略
// 'local' 用帳號密碼來做驗證
// 設定關掉 sessions(不用 cookie-based 做驗證了，也就不需要 Passport 幫我們建立 session)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

// 設定錯誤處理的路由
router.use('/', apiErrorHandler)

module.exports = router
