require('dotenv').config();
const schedule = require('node-schedule');


const { getItemsPageData, getItemSalesHistory, sleep, sortItems, getHumanDateNow, sendInfoAboutCreatedBaseToTg, connectToDb, updateDataInDb } = require('./src/functions/functions');

async function main() {
  const proxyes = require('./src/resources/proxyes.json')
  const items = []
  let proxyCounter = 0
  let offset = 0

  //Получаем все айтемы с сайта

  while (true) {
    const result = await getItemsPageData(offset, proxyes[proxyCounter])
    if (result[0]) {
      if (result[1]['data']['items']['paginatorInfo']['count'] > 0) {
        for (const item of result[1]['data']['items']['data']) {
          items.push(item)
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
    console.log(proxyCounter)
  }

  //Фильтрация полученных айтемов

  const goodItems = []
  proxyCounter = 0
  let counter = 0
  while (counter < items.length) {
    const salesData = await getItemSalesHistory(items[counter]['market_hash_name'], proxyes[proxyCounter])
    if (salesData[0]) {
      const isItemGood = await sortItems(salesData[1]['data']['history'], items[counter]['price'])

      if (isItemGood) {
        goodItems.push({
          item_name: items[counter]['market_hash_name'],
          item_price: items[counter]['price'],
        })
      }

      counter += 1
    }

    proxyCounter += 1
    if (proxyCounter >= proxyes.length) {
      proxyCounter = 0
    }
  }
  
  //Обновление данных в БД

  const client = await connectToDb(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME)
  await updateDataInDb(client, goodItems)
  await sendInfoAboutCreatedBaseToTg(process.env.TG_API_TOKEN, process.env.TG_CHAT_ID, goodItems.length, getHumanDateNow())
}

schedule.scheduleJob({
  hour: 10,
  minute: 0,
  tz: 'Europe/Moscow',
}, async () => {
  await main()
})