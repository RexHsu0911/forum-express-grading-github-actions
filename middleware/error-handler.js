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
  },
  // 增加 API 專用的 error handler
  // 請求失敗：回應 status:error 及錯誤訊息，來告訴前端後端這裡出了什麼狀況
  apiErrorHandler (err, req, res, next) {
    if (err instanceof Error) {
      // 指優先套用特定條件下給定的 status 為回應的，若沒有特別設定，則預設為 500(為伺服器出錯 (Internal Server Error))，資料格式是 JSON
      res.status(err.status || 500).json({
        status: 'error',
        message: `${err.name}: ${err.message}`
      })
    } else {
      res.status(500).json({
        status: 'error',
        message: `${err}`
      })
    }
    next(err)
  }
}
