import axios from 'axios';
import blackListFilter from '../utils/blackListFilter.js';
import appendDataToLogFile from '../utils/appendDataToLogFile.js';

const getAllItems = async (logFilePath) => {
  try {
    const response = await axios('https://market.csgo.com/api/v2/dictionary/names.json', {
      method: 'GET',
      responseType: 'json',
    })
    let items = response.data['items'].map(item => item['hash_name'])
    items = await blackListFilter(items)
    return {success: true, items}
  } catch (e) {
    await appendDataToLogFile(logFilePath, 'getAllItems', e.message)
    return {success: false, items: []}
  }
}


export default getAllItems