// fs (File system) 模組是 Node.js 提供專門來處理檔案的原生模組
const fs = require('fs')

const localFileHandler = file => { // file 是 multer 處理完的檔案
  return new Promise((resolve, reject) => {
    // 檔案是否存在
    if (!file) return resolve(null)

    // 把檔案複製一份到 upload 用來對外的資料夾底下
    const fileName = `upload/${file.originalname}`
    return fs.promises.readFile(file.path)
      .then(data => fs.promises.writeFile(fileName, data))
      .then(() => resolve(`/${fileName}`))
      .catch(err => reject(err))
  })
}

module.exports = {
  localFileHandler
}
