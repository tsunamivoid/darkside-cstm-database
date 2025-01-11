const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

module.exports = async (offset, proxy) => {
  const proxyString = proxy.split(':')
  const agent = new HttpsProxyAgent(
    `http://${proxyString[2]}:${proxyString[3]}@${proxyString[0]}:${proxyString[1]}`
  )
  try {
    const response = await axios('https://market.csgo.com/api/graphql', {
      method: 'POST',
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Referer": "https://market.csgo.com/en/?priceMin=1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      data: {
        operationName: 'items',
        variables: {
          filters: [
            {
              id: 'price',
              min: 1,
            }
          ],
          order: {
            id: 'default',
            direction: 'desc',
          },
          offset,
          count: 400,
        },
        query: `
          query items($count: Int, $filters: [FilterInputType], $page: Int, $offset: Int, $order: OrderInputType!) {
            items(
              count: $count
              filters: $filters
              page: $page
              order: $order
              offset: $offset
            ) {
              paginatorInfo {
                count
                currentPage
                hasMorePages
                lastPage
                perPage
                total
                __typename
              }
              filters {
                id
                items {
                  color
                  id
                  name
                  plural
                  icons
                  image
                  items {
                    image
                    color
                    id
                    name
                    icons
                    __typename
                  }
                  __typename
                }
                min_value
                max_value
                min_range
                max_range
                min
                max
                step
                name
                order
                type
                value
                open
                __typename
              }
              meta {
                title
                description
                __typename
              }
              data {
                color
                id
                currency
                stattrak
                slot
                popularity
                features
                rarity
                my_item
                rarity_ext {
                  id
                  name
                  __typename
                }
                ctp
                quality
                phase
                descriptions {
                  type
                  value
                  __typename
                }
                type
                tags {
                  category
                  category_name
                  localized_category_name
                  localized_tag_name
                  internal_name
                  name
                  value {
                    name
                    link
                    __typename
                  }
                  __typename
                }
                image_512
                image_100
                image_150
                image_300
                seo {
                  category
                  type
                  __typename
                }
                market_hash_name
                market_name
                price
                stickers {
                  image
                  name
                  __typename
                }
                __typename
              }
              paginatorInfo {
                count
                currentPage
                hasMorePages
                lastPage
                perPage
                total
                __typename
              }
              __typename
            }
          }
        `
      },
      httpsAgent: agent,
      responseType: 'json',
    })
    return [true, response.data]
  } catch (e) {
    return [false, e.message]
  }
}