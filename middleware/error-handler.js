module.exports = {
  generalErrorHandler (err, req, res, next) {
    // 判斷 err 是否為 Error 的物件
    if (err instanceof Error) {
      req.flash('error_messages', `${err.name}: ${err.message}`)
    } else {
      req.flash('error_messages', `${err}`)
    }
    res.redirect('back')
    // err 傳下去可以做為其他錯誤的 log
    next(err)
  }
}
