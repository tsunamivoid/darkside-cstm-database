module.exports = async (salesArray, price) => {
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000
  const currentTime = Date.now()

  const oneWeekAgo = currentTime - oneWeekInMilliseconds

  const recentItems = salesArray.filter(item => (item.time * 1000) >= oneWeekAgo)

  if (recentItems.length === 0) {
    return false
  }

  const totalSales = recentItems.reduce((sum, item) => sum + item.count, 0)

  if (price >= 1 && price < 10 && totalSales >= 7) {
    return true
  }

  if (price >= 10 && price < 50 && totalSales >= 5) {
    return true
  }

  if (price >= 50 && totalSales >= 3) {
    return true
  }

  return false
}