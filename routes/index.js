const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const restaurantController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')

router.use('/admin', admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/restaurants', restaurantController.getRestaurants)
// 設定 fallback 路由，router.use 在任何HTTP請求方法（GET、POST、PUT等）都能執行
router.use('/', (req, res) => res.redirect('/restaurants'))

module.exports = router
