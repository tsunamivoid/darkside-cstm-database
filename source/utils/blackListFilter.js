import fs from 'fs/promises';
import { join, resolve } from 'path';

const blackListFilter = async (items) => {
  const hashNames = []
  const blackListFilesPath = join(resolve(), 'source', 'blacklist')

  const fileNames = await fs.readdir(blackListFilesPath, 'utf-8')
  for (const file of fileNames) {
    const filePath = join(blackListFilesPath, file)
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
    hashNames.push(...data)
  }
  
  return items.filter(item => !hashNames.includes(item))
}


export default blackListFilter