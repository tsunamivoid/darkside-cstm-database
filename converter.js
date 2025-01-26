const fs = require('fs').promises;

(async () => {
  const base = require('./liq.json')
  let clearItems = {}
  for (const item in base) {
    clearItems[item] = {
      item_price: base[item]['item_price']
    }
  }
  await fs.writeFile('new.json', JSON.stringify(clearItems, null, 2))
})()