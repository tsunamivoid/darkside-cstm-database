module.exports = async (sales, price) => {
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000
  const currentTime = Date.now()
  const oneWeekAgo = currentTime - oneWeekInMilliseconds

  const recentItems = sales.filter(item => (item.time * 1000) >= oneWeekAgo)

  if (price < 1.5) {
    return false
  }

  if (recentItems.length === 0) {
    return false
  }

  const totalSales = recentItems.reduce((sum, item) => sum + item.count, 0)

  if (price >= 1 && price < 10 && totalSales >= 20) {
    return true
  }

  if (price >= 10 && price < 50 && totalSales >= 15) {
    return true
  }

  if (price >= 50 && totalSales >= 5) {
    return true
  }

  return false
}