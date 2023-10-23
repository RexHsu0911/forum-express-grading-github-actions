const { Category } = require('../models')

const categoryServices = {
  getCategories: (req, cb) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      // 若參數裡有 id 存在，就撈出這 id 的資料(變數 category)並傳到 views，否則就傳空值
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        if (!categories) {
          const err = new Error("categories didn't exist!")
          err.status = 404
          throw err
        }
        if (!categories && !category) {
          const err = new Error("Category didn't exist!")
          err.status = 404
          throw err
        }
        cb(null, { categories, category })
      })
      .catch(err => cb(err))
  },
  postCategory: (req, cb) => {
    const { name } = req.body
    if (!name) {
      const err = new Error('Category name is required!')
      err.status = 400
      throw err
    }
    return Category.findOne({ where: { name } })
      .then(categoryName => {
        if (categoryName) {
          const err = new Error('Category name already existed!')
          err.status = 409
          throw err
        }

        return Category.create({ name })
      })
      .then(newCategory => cb(null, { category: newCategory }))
      .catch(err => cb(err))
  },
  putCategory: (req, cb) => {
    const { name } = req.body
    if (!name) {
      const err = new Error('Category name is required!')
      err.status = 400
      throw err
    }
    return Promise.all([
      Category.findByPk(req.params.id),
      Category.findOne({ where: { name } })
    ])
      .then(([category, categoryName]) => {
        if (!category) {
          const err = new Error("Category didn't exist!")
          err.status = 404
          throw err
        }
        if (categoryName) {
          const err = new Error('Category name already existed!')
          err.status = 409
          throw err
        }

        return category.update({ name })
      })
      .then(editedCategory => cb(null, { category: editedCategory }))
      .catch(err => cb(err))
  },
  deleteCategory: (req, cb) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        // 反查，確認要刪除的類別存在，再進行下面刪除動作
        if (!category) {
          const err = new Error("Category didn't exist!")
          err.status = 404
          throw err
        }

        return category.destroy()
      })
      .then(deletedCategory => cb(null, { category: deletedCategory }))
      .catch(err => cb(err))
  }
}

module.exports = categoryServices
