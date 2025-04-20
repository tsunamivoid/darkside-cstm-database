const getItemStatusBySales = async (itemSales, mainPrice) => {
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000
  const currentTime = Date.now()
  const oneWeekAgo = currentTime - oneWeekInMilliseconds

  const recentItems = itemSales.filter(item => (item.time * 1000) >= oneWeekAgo)

  if (mainPrice < 1.5) {
    return false
  }

  if (recentItems.length === 0) {
    return false
  }

  const totalSales = recentItems.reduce((sum, item) => sum + item.count, 0)

  if (mainPrice >= 1 && mainPrice < 10 && totalSales >= 20) {
    return true
  }

  if (mainPrice >= 10 && mainPrice < 50 && totalSales >= 15) {
    return true
  }

  if (mainPrice >= 50 && totalSales >= 5) {
    return true
  }

  return false
}


export default getItemStatusBySales