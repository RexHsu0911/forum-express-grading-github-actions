const express = require('express')
const router = express.Router()

const restaurantController = require('../../controllers/apis/restaurant-controller')

router.get('/restaurants', restaurantController.getRestaurants)

module.exports = router
