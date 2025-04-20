import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import appendDataToLogFile from '../utils/appendDataToLogFile.js';

const getActualPrice = async (hashName, proxy, logFilePath) => {
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
        operationName: 'viewItem',
        variables: {
          market_hash_name: hashName,
        },
        query: `
          query viewItem($id: String, $market_hash_name: String!, $phase: String) {
            viewItem(id: $id, market_hash_name: $market_hash_name, phase: $phase) {
              asset
              color
              price
              itemtype
              quality
              popularity
              ctp
              seo {
                category
                type
                __typename
              }
              meta {
                title
                description
                __typename
              }
              jsonSchema
              rarity
              rarity_ext {
                id
                name
                __typename
              }
              slot
              stattrak
              stattrak_name
              quality
              links {
                view_3d
                view_in_game
                view_screenshot
                view_refresh_image
                __typename
              }
              stickers {
                image
                name
                id
                price
                currency
                __typename
              }
              tags {
                category
                category_name
                internal_name
                localized_category_name
                localized_tag_name
                name
                value {
                  link
                  name
                  __typename
                }
                __typename
              }
              type
              currency
              descriptions {
                type
                value
                rarity
                __typename
              }
              features
              float {
                paintindex
                paintseed
                paintwear
                screenshot
                __typename
              }
              id
              my_item
              my_order {
                price
                total
                __typename
              }
              my_notify {
                price
                __typename
              }
              status
              image_512
              market_hash_name
              market_name
              market_name_ext {
                subtitle
                title
                __typename
              }
              quality_ext {
                id
                subtitle
                title
                __typename
              }
              phase
              phase_short
              seller {
                nick
                avatar
                chance_to_transfer
                steam_lvl
                profile
                hidden
                __typename
              }
              __typename
            }
          }
        `
      },
      //httpsAgent: agent,
      responseType: 'json',
    })
    return {success: true, actualPrice: response.data['data']['viewItem']['price']}
  } catch (e) {
    await appendDataToLogFile(logFilePath, 'getActualPrice', e.message)
    return {success: false, actualPrice: NaN}
  }
}


export default getActualPrice