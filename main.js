require('dotenv').config();
const fs = require('fs').promises;

const PROXYES = require('./src/resources/proxyes.json');
const TG_API_TOKEN = process.env.TG_API_TOKEN
const TG_CHAT_ID = process.env.TG_CHAT_ID

const {
  getAllItems,
  getItemSalesHistory,
  getAvgPrice,
  sortItem,
  sendBaseToTg,
  getActualPrice,
  getBoostFactor,
  sleep,
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
      isItemBoosted: true,
      boostPercent: 0,
    })
  }

  // Получение истории продаж каждого предмета
  let proxyesCounter = 0
  let counter = 0
  while (counter < items.length) {
    const result = await getItemSalesHistory(items[counter]['item_name'], PROXYES[proxyesCounter])
    const isBoosted = await getBoostFactor(result[1]['data']['history'])
    if (result[0]) {
      for (const sale of result[1]['data']['history']) {
        items[counter]['item_sales_history'].push(sale)
      }
      const priceResult = await getAvgPrice(items[counter]['item_sales_history'])
      if (!isNaN(priceResult[0])) {
        const actualPriceResult = await getActualPrice(items[counter]['item_name'], PROXYES[proxyesCounter])
        try {
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
            items[counter]['isItemBoosted'] = isBoosted[0]
            items[counter]['boostPercent'] = isBoosted[1]

            console.log(items[counter])
          } else {
            
          }
        } catch {
          
        }
      } else {

      }
    }
    proxyesCounter += 1
    if (proxyesCounter >= PROXYES.length) {
      proxyesCounter = 0
    }
    console.log(items[counter]['item_price'], items[counter]['item_name'], items[counter]['isItemGood'], counter)
    //await fs.writeFile('test.json', JSON.stringify(items[counter], null, 2))
    counter += 1
  }

  // Запись данных
  const rsBase = {}
  for (const item of items) {
    if (item['isItemGood'] && !item['isItemBoosted']) {
      rsBase[item['item_name']] = {
        item_price: item['item_price'],
      }
    }
  }

  const techBase = {}
  for (const item of items) {
    if (item['isItemGood'] && !item['isItemBoosted']) {
      techBase[item['item_name']] = {
        item_price: item['item_price'],
        price_type: item['price_type'],
        sales_count_week: item['sales_count_week'],
        sales_count_mounth: item['sales_count_mounth'],
        isItemGood: item['isItemGood'],
        isItemBoosted: item['isItemBoosted'],
        boostPercent: item['boostPercent'],
      }
    }
  }

  await fs.unlink('liq.json')
  await fs.unlink('tech.json')
  await sleep(5000)
  await fs.writeFile('liq.json', JSON.stringify(rsBase, null, 2))
  await fs.writeFile('tech.json', JSON.stringify(techBase, null, 2))

  // Отправка базы в ТГ-канал
  const response = await sendBaseToTg(TG_API_TOKEN, TG_CHAT_ID, Object.keys(rsBase).length, new Date().toLocaleDateString(), 'liq')
  console.log(response)
  const responsetech = await sendBaseToTg(TG_API_TOKEN, TG_CHAT_ID, Object.keys(techBase).length, new Date().toLocaleDateString(), 'tech')
  console.log(responsetech)
}


main()