const express = require('express')
const router = express.Router()

const restaurantController = require('../controllers/restaurant-controller')
const admin = require('./modules/admin')

router.use('/admin', admin)

router.get('/restaurants', restaurantController.getRestaurants)
// 設定 fallback 路由，router.use 在任何HTTP請求方法（GET、POST、PUT等）都能執行
router.use('/', (req, res) => res.redirect('/restaurants'))

module.exports = router
