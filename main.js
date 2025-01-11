require('dotenv').config();
const fs = require('fs').promises;
const schedule = require('node-schedule');


const { getItemsPageData, getItemSalesHistory, sleep, sortItems, getHumanDateNow, sendInfoAboutCreatedBaseToTg, connectToDb, updateDataInDb, getItemLastOfferPrice } = require('./src/functions/functions');

async function main() {
  const proxyes = require('./src/resources/proxyes.json')
  const items = []
  let proxyCounter = 0
  let offset = 0

  //Получаем все айтемы с сайта

  console.log('Получение всех предметов')
  while (true) {
    const result = await getItemsPageData(offset, proxyes[proxyCounter])
    if (result[0]) {
      if (result[1]['data']['items']['paginatorInfo']['count'] > 0) {
        for (const item of result[1]['data']['items']['data']) {
          items.push({
            "item_name": item['market_hash_name'],
            "item_price": 0.0,
            "item_sales": [],
          })
        }
        offset += 400
      } else {
        break
      }
    }
    
    proxyCounter += 1
    if (proxyCounter >= proxyes.length) {
      proxyCounter = 0
    }
    console.log(`Прокси: ${proxyCounter-1} | Всего: ${items.length}`)
  }

  //Получаем последнее предложение рынка

  let counter = 0
  proxyCounter = 0
  console.log('Получение актуальной цены')
  while (counter < items.length) {
    const result = await getItemLastOfferPrice(items[counter]['item_name'], proxyes[proxyCounter])
    if (result[0]) {
      items[counter]['item_price'] = result[1]
      counter +=1
    }

    proxyCounter += 1
    if (proxyCounter >= proxyes.length) {
      proxyCounter = 0
    }
    console.log(`Прокси: ${proxyCounter-1} | Предмет №: ${counter-1} | Название: ${items[counter-1]['item_name']}`)
  }

  //Получаем массив продаж предмета

  counter = 0
  proxyCounter = 0
  console.log('Получение истории продаж')
  while (counter < items.length) {
    const salesData = await getItemSalesHistory(items[counter]['item_name'], proxyes[proxyCounter])
    if (salesData[0]) {
      for (const sale of salesData[1]['data']['history']) {
        items[counter]['item_sales'].push(sale)
      }
      counter += 1
    }

    proxyCounter += 1
    if (proxyCounter >= proxyes.length) {
      proxyCounter = 0
    }
    console.log(`Прокси: ${proxyCounter-1} | Предмет №: ${counter-1} | Название: ${items[counter-1]['item_name']}`)
  }

  //Фильтрация полученных айтемов

  const goodItems = []
  counter = 0
  console.log('Фильтрация')
  while (counter < items.length) {
    const isItemGood = await sortItems(items[counter]['item_sales'], items[counter]['item_price'])
    if (isItemGood) {
      goodItems.push({
        item_name: items[counter]['item_sales'],
        item_price: items[counter]['item_price'],
      })
    }
    counter += 1

    console.log(`Предмет №: ${counter-1} | Название: ${items[counter-1]['item_name']}`)
  }
  
  //Обновление данных в БД

  console.log('Обновление данных в БД')
  const rsBase = {}
  for (const item of goodItems) {
    rsBase[item['item_name']] = {
      "item_price": item['item_price']
    }
  }
  await fs.writeFile('data.json', JSON.stringify(rsBase, null, 2))
  const client = await connectToDb(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME)
  await updateDataInDb(client, goodItems)
  await sendInfoAboutCreatedBaseToTg(process.env.TG_API_TOKEN, process.env.TG_CHAT_ID, goodItems.length, getHumanDateNow())
}

// schedule.scheduleJob({
//   hour: 10,
//   minute: 0,
//   tz: 'Europe/Moscow',
// }, async () => {
//   await main()
// })

main()