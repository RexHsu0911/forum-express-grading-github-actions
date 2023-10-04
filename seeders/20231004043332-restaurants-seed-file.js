'use strict'
// 使用 faker 產生假資料
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 先去查詢(query)現在 Categories table 中的 id 有哪些數值
    const categories = await queryInterface.sequelize.query(
      'SELECT id FROM Categories;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    await queryInterface.bulkInsert('Restaurants',
      // Array.from({ length: 50}) 產生長度為 50 的陣列，再 map 每一個陣列元素都對應到一筆餐廳資料
      Array.from({ length: 50 }, () => ({
        name: faker.name.findName(),
        tel: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        opening_hours: '08:00',
        image: `https://loremflickr.com/320/240/restaurant,food/?random=${Math.random() * 100}`, // 產生 0~100 之間的隨機亂數來獲取圖片
        description: faker.lorem.text(),
        created_at: new Date(),
        updated_at: new Date(),
        category_id: categories[Math.floor(Math.random() * categories.length)].id // 從 Categories table 陣列中的 id 去跑隨機分配
        // 需要 Categories table 先有資料，讓 categories-seed-file.js 排在 restaurants-seed-file.js 前面(重新生成一支新的 restaurants-seed-file.js，內容複製過來，再把原本那支刪掉，最後重跑 seeders 指令(undo => all))
      }))
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Restaurants', {})
  }
}
