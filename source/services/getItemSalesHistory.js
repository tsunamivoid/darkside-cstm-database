import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import appendDataToLogFile from '../utils/appendDataToLogFile.js';

const getItemSalesHistory = async (hashName, proxy, logFilePath) => {
  try {
    const proxyString = proxy.split(':')
    const agent = new HttpsProxyAgent(
      `http://${proxyString[2]}:${proxyString[3]}@${proxyString[0]}:${proxyString[1]}`
    )
    const response = await axios('https://market.csgo.com/api/graphql', {
      method: 'POST',
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Referer": "https://market.csgo.com/en/?priceMin=1.5",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      data: {
        operationName: 'history',
        variables: {
          market_hash_name: hashName,
        },
        query: `
          query history($market_hash_name: String!, $phase: String) {
            history(market_hash_name: $market_hash_name, phase: $phase) {
              price
              time
              count
            }
          }
        `
      },
      httpsAgent: agent,
      responseType: 'json',
    })
    return {success: true, history: response.data['data']['history']}
  } catch (e) {
    await appendDataToLogFile(logFilePath, 'getItemSalesHistory', e.message)
    return {success: false, history: []}
  }
}


export default getItemSalesHistory