import fs from 'fs/promises';
import cliProgress from 'cli-progress';

import makeLogfile from './source/utils/makeLogfile.js';
import getAllItems from './source/services/getAllItems.js';
import getItemSalesHistory from './source/services/getItemSalesHistory.js';
import getAvgMounthOrWeeklyPrice from './source/utils/getAvgMounthOrWeeklyPrice.js';
import getActualPrice from './source/services/getActualPrice.js';
import getItemStatusBySales from './source/utils/getItemStatusBySales.js';

import proxyes from './source/resources/proxyes.json' with { type: 'json' };
import sleep from './source/utils/sleep.js';

const main = async () => {
  const logFilePath = await makeLogfile()

  const rsBase = {}
  const {success, items} = await getAllItems(logFilePath)

  if (!success || !items.length) {
    process.exit(1)
  }

  let counter = 0
  let proxyesCounter = 0
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(items.length, 0)
  while (counter < items.length) {
    const {success, history} = await getItemSalesHistory(items[counter], proxyes[proxyesCounter], logFilePath)

    if (success && history.length) {
      const avgPrice = await getAvgMounthOrWeeklyPrice(history)
      const {success, actualPrice} = await getActualPrice(items[counter], proxyes[proxyesCounter], logFilePath)
      if (success) {
        const mainPrice = actualPrice < avgPrice ? actualPrice : avgPrice
        const isItemGood = await getItemStatusBySales(history, mainPrice)
        if (isItemGood) {
          rsBase[items[counter]] = {
            item_price: mainPrice,
          }
        }
      }
    }

    proxyesCounter += 1
    if (proxyesCounter >= proxyes.length) {
      proxyesCounter = 0
    }
    counter += 1
    bar.update(counter)
  }

  await fs.unlink('output/liq.json')
  await sleep(5000)
  await fs.writeFile('output/liq.json', JSON.stringify(rsBase, null, 2))
  bar.stop()
}


main()