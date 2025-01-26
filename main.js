require('dotenv').config();
const fs = require('fs').promises;

const PROXYES = require('./src/resources/proxyes.json');
const TG_API_TOKEN = process.env.TG_API_TOKEN
const TG_CHAT_ID = process.env.TG_CHAT_ID
const DB_HOST = process.env.DB_HOST
const DB_PORT = process.env.DB_PORT
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME

const {
  getAllItems,
  getItemSalesHistory,
  getAvgPrice,
  sortItem,
  sendBaseToTg,
  getActualPrice,
} = require('./src/functions/functions');

async function main() {
  let items = []
  // Получение всех предметов с сайта
  const result = await getAllItems()
  if (!result[0]) {
    process.exit(1)
  }
  for (const item of result[1]['items']) {
    items.push({
      item_name: item['hash_name'],
      item_price: 0,
      price_type: '',
      sales_count_week: 0,
      sales_count_mounth: 0,
      item_sales_history: [],
      isItemGood: false,
    })
  }

  // Получение истории продаж каждого предмета
  let proxyesCounter = 0
  let counter = 0
  while (counter < items.length) {
    const result = await getItemSalesHistory(items[counter]['item_name'], PROXYES[proxyesCounter])
    if (result[0]) {
      for (const sale of result[1]['data']['history']) {
        items[counter]['item_sales_history'].push(sale)
      }
      const priceResult = await getAvgPrice(items[counter]['item_sales_history'])
      if (!isNaN(priceResult[0])) {
        const actualPriceResult = await getActualPrice(items[counter]['item_name'], PROXYES[proxyesCounter])
        if (actualPriceResult[1]['data']['viewItem']) {
          const actualPrice = actualPriceResult[1]['data']['viewItem']['price']
          if (actualPrice < priceResult[0]) {
            items[counter]['item_price'] = actualPrice
          } else {
            items[counter]['item_price'] = priceResult[0]
          }
          items[counter]['price_type'] = priceResult[1]
          items[counter]['sales_count_week'] = priceResult[2]
          items[counter]['sales_count_mounth'] = priceResult[3]
          items[counter]['isItemGood'] = await sortItem(items[counter]['item_sales_history'], items[counter]['item_price'])
        } else {
          console.log('Нет актуальной цены')
        }
      } else {
        console.log('NaN')
      }
    }
    proxyesCounter += 1
    if (proxyesCounter >= PROXYES.length) {
      proxyesCounter = 0
    }
    console.log(items[counter]['item_price'], items[counter]['item_name'], items[counter]['isItemGood'], counter)
    counter += 1
  }

  // Запись данных
  const rsBase = {}
  for (const item of items) {
    if (item['isItemGood']) {
      rsBase[item['item_name']] = {
        item_price: item['item_price'],
      }
    }
  }
  await fs.writeFile('liq.json', JSON.stringify(rsBase, null, 2))

  // Отправка базы в ТГ-канал
  const response = await sendBaseToTg(TG_API_TOKEN, TG_CHAT_ID, Object.keys(rsBase).length, new Date().toLocaleDateString())
  console.log(response)
}



main()