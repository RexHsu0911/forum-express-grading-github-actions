const jwt = require('jsonwebtoken')

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
  }
}

module.exports = userController
