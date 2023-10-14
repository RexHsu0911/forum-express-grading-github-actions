const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')

const restaurantController = require('../../controllers/apis/restaurant-controller')

const { apiErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', admin)

router.get('/restaurants', restaurantController.getRestaurants)

// 設定錯誤處理的路由
router.use('/', apiErrorHandler)

module.exports = router
