// 未來我們可能不一定會繼續用 Passport 這個套件來做使用者驗證，或者萬一 Passport 套件的設定有調整，這個 req.user的寫法可能會需要改變，獨立一個的地方負責管理使用者驗證
const getUser = req => {
  return req.user || null
}
module.exports = {
  getUser
}
