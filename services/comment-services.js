const { Comment, User, Restaurant } = require('../models')

const commentServices = {
  postComment: (req, cb) => {
  // 從 req 中取出表單發送過來的 text、restaurantId 及 userId 資料
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) {
      const err = new Error('Comment text is required!')
      err.status = 400
      throw err
    }

    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) {
          const err = new Error("User didn't exist!")
          err.status = 404
          throw err
        }
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist!")
          err.status = 404
          throw err
        }

        return Comment.create({
          text,
          restaurantId,
          userId
        })
      })
      .then(newComment => cb(null, { comment: newComment }))
      .catch(err => cb(err))
  },
  deleteComment: (req, cb) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) {
          const err = new Error("Comment didn't exist!")
          err.status = 404
          throw err
        }

        return comment.destroy()
      })
      .then(deletedComment => cb(null, { comment: deletedComment }))
      .catch(err => cb(err))
  }
}

module.exports = commentServices
