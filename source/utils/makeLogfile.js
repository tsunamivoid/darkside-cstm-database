import fs from 'fs/promises';
import path from 'path';

const makeLogFile = async () => {
  const logFilePath = path.join(path.resolve(), 'source', 'logs', `${new Date().getTime()}.log`)
  await fs.writeFile(logFilePath, '', 'utf-8')
  return logFilePath
}


export default makeLogFile