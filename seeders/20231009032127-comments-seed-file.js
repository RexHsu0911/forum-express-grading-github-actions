'use strict'
// 使用 faker 產生假資料
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 先去查詢(query)現在 users / restaurants table 中的 id 有哪些數值
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const restaurants = await queryInterface.sequelize.query(
      'SELECT id FROM Restaurants;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    await queryInterface.bulkInsert('Comments',
    // Array.from({ length: 50}) 產生長度為 50 的陣列，再 map 每一個陣列元素都對應到一筆餐廳資料
      Array.from({ length: 50 }, () => ({
        text: faker.lorem.sentence(),
        // 從 users / restaurants table 陣列中的 id 去跑隨機分配
        user_id: users[Math.floor(Math.random() * users.length)].id,
        restaurant_id: restaurants[Math.floor(Math.random() * restaurants.length)].id,
        created_at: new Date(),
        updated_at: new Date()
      }))
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', {})
  }
}
