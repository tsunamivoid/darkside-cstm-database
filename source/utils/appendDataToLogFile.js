import fs from 'fs/promises';

const appendDataToLogFile = async (logFilePath, funcName, message) => {
  await fs.appendFile(logFilePath, `${funcName} | ${message}\n`)
}


export default appendDataToLogFile