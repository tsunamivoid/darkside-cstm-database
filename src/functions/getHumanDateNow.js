module.exports = () => {
  const currentDate = new Date()
  const readableDate = currentDate.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return readableDate
}