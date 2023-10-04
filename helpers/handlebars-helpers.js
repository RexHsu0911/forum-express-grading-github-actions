const dayjs = require('dayjs')

module.exports = {
  // 取得當年年份作為 currentYear 的屬性值，並導出
  currentYear: () => dayjs().year(),
  // 傳入的參數 a 和 b 對應到文件上的 conditions，使用三元運算子來簡化 if/else 流程，若 a 和 b 相等，會回傳 options.fn(this)，不相等則回傳 options.inverse(this)
  // 刻意不用箭頭函式，避免取到預期外的值
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
}
