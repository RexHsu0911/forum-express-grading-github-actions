const express = require('express')
const router = express.Router()

const passport = require('../config/passport')

const admin = require('./modules/admin')

const restaurantController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')

// 把驗證程序 authenticatedAdmin 向上抽離到 routes/index.js
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

// 只要是 admin 相關的路由，都要經過 auth.js 這個 middleware 的權限檢查，通過才能往下走
router.use('/admin', authenticatedAdmin, admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
// 請 Passport 直接做身分驗證
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/logout', userController.logout)

router.get('/restaurants', authenticated, restaurantController.getRestaurants)
// 設定 fallback 路由，router.use 在任何HTTP請求方法（GET、POST、PUT等）都能執行
router.use('/', (req, res) => res.redirect('/restaurants'))

router.use('/', generalErrorHandler)

module.exports = router
