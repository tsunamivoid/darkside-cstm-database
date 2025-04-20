const fs = require('fs/promises');
const items = require('../../items.json');

async function main() {
  const names = []
  for (const item of items['items']) {
    if (item['hash_name'].includes('Souvenir')) {
      names.push(item['hash_name'])
    }
  }
  await fs.writeFile('data.json', JSON.stringify(names, null, 2), 'utf-8')
}

main()