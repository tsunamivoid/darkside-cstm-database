const axios = require('axios');

module.exports = async () => {
  try {
    const response = await axios('https://market.csgo.com/api/v2/dictionary/names.json', {
      method: 'GET',
      responseType: 'json',
    })
    return [true, response.data]
  } catch {
    return [false, null]
  }
}