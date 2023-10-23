// fs (File system) 模組是 Node.js 提供專門來處理檔案的原生模組
const fs = require('fs')
// imgur 網路相簿服務
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

imgur.setClientId(IMGUR_CLIENT_ID)

const localFileHandler = file => { // file 是 multer 處理完的檔案
  return new Promise((resolve, reject) => {
    // 檔案是否存在，若不存在，則回傳空值
    if (!file) return resolve(null)

    // 把檔案複製一份到 upload 資料夾底下
    const fileName = `upload/${file.originalname}` // file.originalname 表示上傳的檔案的原始檔案名稱
    return fs.promises.readFile(file.path) // fs.promises.readFile 用於非同步讀取文件的內容；file.path 表示伺服器上儲存上傳檔案的路徑
      .then(data => fs.promises.writeFile(fileName, data)) // fs.promises.writeFile 用於非同步寫入文件的內容；data 為要寫入文件的數據
      .then(() => resolve(`/${fileName}`)) // 回傳存儲檔案路徑
      .catch(err => reject(err))
  })
}

const imgurFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)

    return imgur.uploadFile(file.path)
      .then(img => {
        // 嘗試解析出圖片的連結（img?.link），如果成功，則使用resolve將Promise解析為該圖片連結
        resolve(img?.link || null)
      })
      .catch(err => reject(err))
  })
}

module.exports = {
  localFileHandler,
  imgurFileHandler
}
