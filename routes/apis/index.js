const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')

const restaurantController = require('../../controllers/apis/restaurant-controller')

router.use('/admin', admin)

router.get('/restaurants', restaurantController.getRestaurants)

module.exports = router
