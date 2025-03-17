module.exports = async (timestampArray) => {
  if (timestampArray.length < 2) {
    return [true, 0]
  }
  const lastPrice = timestampArray[timestampArray.length - 1]['price']
  const firstPrice = timestampArray[0]['price']

  console.log(lastPrice, firstPrice)

  console.log(((firstPrice - lastPrice) / lastPrice) * 100)

  if (((firstPrice - lastPrice) / lastPrice) * 100 >= 30) {
    return [true, ((firstPrice - lastPrice) / lastPrice) * 100]
  }

  return [false, ((firstPrice - lastPrice) / lastPrice) * 100]
}