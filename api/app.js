const express = require('express')
var cors = require('cors')
const app = express()

const port = 3000

const { Client } = require('pg')
const client = new Client({
    host: '172.17.0.3',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
})

client
  .connect()
  .then(() => console.log('connected'))
  .catch((err) => console.error('connection error', err.stack))

app.use(cors())

app.get('/', async (req, res) => {
  const record = await client.query('WITH t AS (SELECT * FROM blocks ORDER BY block_number DESC LIMIT 50) SELECT * FROM t ORDER BY block_number ASC;')

  res.send(record.rows)
  //await client.end()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})