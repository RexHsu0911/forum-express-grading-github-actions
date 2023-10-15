// Services - 負責商業邏輯運算
const restaurantServices = require('../../services/restaurant-services')

// Controllers - 處理流程控制，負責接收資料來源及整理回傳結果
const restaurantController = {
  getRestaurants: (req, res, next) => {
    // callback function 若沒有 error ，則取得資料(data)並回傳 JSON
    // res.json 要回應的內容是 JSON 格式的資料
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getDashboard: (req, res, next) => {
    restaurantServices.getDashboard(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = restaurantController
