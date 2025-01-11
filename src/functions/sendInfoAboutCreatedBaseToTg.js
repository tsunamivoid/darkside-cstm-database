const axios = require('axios');

module.exports = async (apiToken, chatId, baseLen, dateCreate) => {
  const response = await axios(`https://api.telegram.org/bot${apiToken}/sendMessage`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      chat_id: chatId,
      text: `New base was created:\n\nBase len: <b>${baseLen}</b>\nData update: <b>${dateCreate}</b>\n\nBase name: <b>CSTM</b>`,
      parse_mode: 'HTML',
    }),
  })
}