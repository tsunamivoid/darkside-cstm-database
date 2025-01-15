module.exports = async (itemSales) => {
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000
  const oneMounthInMilliseconds = 30 * 24 * 60 * 60 * 1000
  const currentTime = Date.now()
  const oneWeekAgo = currentTime - oneWeekInMilliseconds
  const oneMounthAgo = currentTime - oneMounthInMilliseconds

  let priceWeek = 0
  let priceMounth = 0
  let weekSalesCount = 0
  let mounthSalesCount = 0

  for (const sale of itemSales) {
    if ((sale['time'] * 1000) > oneWeekAgo) {
      priceWeek += sale['price']
      weekSalesCount += sale['count']
    } else {
      break
    }
  }

  priceWeek = priceWeek / weekSalesCount

  for (const sale of itemSales) {
    if ((sale['time'] * 1000) > oneMounthAgo) {
      priceMounth += sale['price']
      mounthSalesCount += sale['count']
    } else {
      break
    }
  }

  priceMounth = priceMounth / mounthSalesCount

  let mounthDiff = ((priceWeek - priceMounth) / (priceMounth)) * 100

  if (mounthDiff < 0) {
    mounthDiff = mounthDiff * (-1)
  }

  if (mounthDiff > 10 && priceMounth < priceWeek) {
    return [priceMounth, 'mounthAvg', weekSalesCount, mounthSalesCount]
  }

  if (priceMounth < priceWeek) {
    return [priceMounth, 'mounthAvg', weekSalesCount, mounthSalesCount]
  }

  return [priceWeek, 'weekAvg', weekSalesCount, mounthSalesCount]
}