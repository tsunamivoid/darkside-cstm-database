const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

module.exports = async (botToken, botChatId, baseLen, baseDate) => {
  try {
    const baseJsonPath = path.resolve(__dirname, '../../liq.json')
    const form = new FormData()
    form.append('chat_id', botChatId)
    form.append('document', fs.createReadStream(baseJsonPath))
    form.append(
      'caption',
      `New base created:\n\nBase length: ${baseLen}\n\nDate of create: ${baseDate}`
    )
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      form,
      {
        headers: form.getHeaders()
      }
    )
    return [true, response.status]
  } catch (e) {
    console.log(e)
    return [false]
  }
}