const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.callisto.network/');



const { Client } = require('pg')
const client = new Client({
    host: '172.17.0.2',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
})

client
    .connect()
    .then(() => console.log('connected'))
    .catch((err) => console.error('connection error', err.stack))



async function insertBlocks() {
    const blockReward = 77.3
    const lastBlockIndexed = await client.query('SELECT * FROM supply ORDER BY block_number DESC LIMIT 1')
    const currentBlock = await provider.getBlockNumber()

    const blockNumber = parseInt(lastBlockIndexed.rows[0].block_number)

    if (blockNumber < currentBlock) {
        let burnedInThisBlock = ethers.BigNumber.from(0);
        let burnedInEther = 0;

        //console.log("Current Block" + currentBlock)
        //console.log("Last Block Indexed")
        //console.log("Block Number: " + blockNumber)
        //console.log("Supply: " + lastBlockIndexed.rows[0].coin_supply)
        //console.log("Date: " + lastBlockIndexed.rows[0].created_at)

        const block = await provider.getBlock(blockNumber + 1);
        const date = block.timestamp;
        const baseFeePerGas = block.baseFeePerGas
        const transactions = block.transactions;
        for (const transaction of transactions) {
            const transactionReceipt = await provider.getTransactionReceipt(transaction);
            const gasUsed = transactionReceipt.gasUsed
            burnedInThisBlock = burnedInThisBlock.add(baseFeePerGas.mul(gasUsed))
            burnedInEther = utils.formatEther(burnedInThisBlock)
        };

        //console.log("Next Block")
        //console.log("Block Number: " + (blockNumber + 1))
        //console.log("Supply: " + (parseFloat(lastBlockIndexed.rows[0].coin_supply) - burnedInEther + blockReward))
        //console.log("Date: " + date)

        let insertBlock = blockNumber + 1
        let insertSupply = parseFloat(lastBlockIndexed.rows[0].coin_supply) - burnedInEther + blockReward
        let insertDate = date

        await client.query(
            `INSERT INTO supply (block_number, coin_supply, created_at)` +
            `VALUES (${insertBlock}, ${insertSupply}, ${insertDate});`
        )

    }
}


//sync = 100
//prod = 30000
setInterval(async function () {
    await insertBlocks()
}, 30000);












