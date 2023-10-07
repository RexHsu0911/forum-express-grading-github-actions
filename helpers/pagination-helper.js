// 每頁 10 筆資料（limit = 10），偏移量（offset）
const getOffset = (limit = 10, page = 1) => (page - 1) * limit

const getPagination = (limit = 10, page = 1, total = 50) => {
  const totalPage = Math.ceil(total / limit) // Math.ceil 無條件進位
  // _ 是一個未使用的參數名稱，代表當前元素，而 index 是當前元素的索引，將索引加 1，以得到我們想要的頁數值(如果 totalPage 為 5，則 pages 陣列將包含 [1, 2, 3, 4, 5])
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1)
  // 先讀 page > totalPage ? totalPage : page，再讀 page < 1 ? 1 : 前一組運算結果
  //  等同於 let currentPage
  // if (page < 1) {
  //   currentPage = 1
  // } else if (page > totalPage) {
  //   currentPage = totalPage
  // } else {
  //   currentPage = page
  // }
  const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page
  const prev = currentPage - 1 < 1 ? 1 : currentPage - 1 // currentPage - 1 若小於 1 ，則為 1
  const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1 // currentPage + 1 若大於 totalPage ，則為 totalPage

  return {
    pages,
    totalPage,
    currentPage,
    prev,
    next
  }
}

module.exports = {
  getOffset,
  getPagination
}
