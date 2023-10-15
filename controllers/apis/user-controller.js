const jwt = require('jsonwebtoken')
const userServices = require('../../services/user-services')

const userController = {
  signIn: (req, res, next) => {
    // 不會進入反序列化中用 toJSON 的程序，因此物件尚未被整理過
    // 先用 toJSON 方法整理物件，再傳入 sign()
    const userData = req.user.toJSON()
    // delete 刪除物件中的屬性，密碼不應該回傳到前端
    delete userData.password
    // jwt.sign() 本身不是非同步事件，執行完成後也不會回傳 Promise 物件(.catch(...)是 Promise 物件的 function)，只能透過 try { ... } catch { ... } 來捕捉到過程中意外產生的錯誤
    // jwt.sign(payload, secretOrPrivateKey, [options, callback]) 簽發 JWT，效期為 30 天
    // payload 想要打包的資訊
    // secretOrPrivateKey 是密鑰，用這組密鑰加上 header 和 payload 進行雜湊(密鑰不會以明碼方式直接寫在程式裡，會放在環境變數中，無法被纂改)
    // expiresIn 指定了這個簽章的有效期限
    try {
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
  // 前端專案會找個方法把 token 儲存在用戶端，假設是 localStorage，當使用者按下畫面上的「登出」按鈕時，發生的事情是前端專案默默地把 localStorage 裡的 token 刪除。後端不需要製作 logout 的 API(任何一個 request 沒有攜帶 token，就代表無法登入)
}

module.exports = userController
