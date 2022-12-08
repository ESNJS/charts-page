const axios = require('axios');

const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.callisto.network/');

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

async function insertBlocks (blockNumber) {
    let burnedInThisBlock = ethers.BigNumber.from(0);


    const response = await axios.get('https://testnet-explorer.callisto.network/api?module=stats&action=coinsupply');

    const block = await provider.getBlock(blockNumber);
    const date = block.timestamp;
    const baseFeePerGas = block.baseFeePerGas
    const transactions = block.transactions;
    for(const transaction of transactions) {
        const transactionReceipt =  await provider.getTransactionReceipt(transaction);
        const gasUsed = transactionReceipt.gasUsed
        burnedInThisBlock = burnedInThisBlock.add(baseFeePerGas.mul(gasUsed))
    };

    //console.log(`Burned ${burnedInThisBlock.toString()} WEI in Block ${blockNumber} at ${date}`)

    const res = await client.query(
        `INSERT INTO blocks (block_number, burned_amount, created_at, coin_supply)`+
                `VALUES (${blockNumber}, ${burnedInThisBlock.toString()}, ${date}, '${response.data}');`
    )
    console.log(res)
    //await client.end()
}



provider.on("block", (blockNumber) => {
    insertBlocks(blockNumber)
})





   


    




