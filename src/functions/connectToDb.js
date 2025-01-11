const { Client } = require('pg');

module.exports = async (host, port, user, password, database) => {
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
  })
  await client.connect()
  return client
}