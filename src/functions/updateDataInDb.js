module.exports = async (client, items) => {
  const query = `
    TRUNCATE TABLE CSTM
    RESTART IDENTITY
  `;

  await client.query(query)

  let counter = 0
  while (counter < items.length) {
    const itemName = items[counter]['item_name']
    const itemPrice = items[counter]['item_price']

    const query = `
      INSERT INTO CSTM (item_name, item_price)
      VALUES ($1, $2)
    `;

    await client.query(query, [itemName, itemPrice])
    counter += 1
    console.log(counter)
  }
  await client.end()
}