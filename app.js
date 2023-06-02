Web3 = require("web3");
Contract = require("web3-eth-contract");
ethers = require("ethers");
// require('dotenv').config();
// db = require('./db_config.js');

Web3 = require("web3");
Contract = require("web3-eth-contract");
ethers = require("ethers");
// require('dotenv').config();
// db = require('./db_config.js');

main();
async function main() {

    let rpc_url = "wss://eth-mainnet.nodereal.io/ws/v1/1659dfb40aa24bbb8153a677b98064d7";
    // web3 = new Web3(rpc_url);

    const provider = new ethers.providers.WebSocketProvider(rpc_url);
    
    // ethers.providers.WebSocketProvider(rpc_url)
    provider.on("block", async (blockNumber) => {
    console.log("start");
    console.log(blockNumber);

    // const block = await provider.getBlock(blockNumber);
    console.log(await provider.getBlock(blockNumber).transactions);
    const block = await provider.getBlockWithTransactions();

    for (let tx of block.transactions) {
      console.log(tx.to);     
    }
    });
}

// main();
// async function main() {

//     let rpc_url = "wss://eth-mainnet.nodereal.io/ws/v1/1659dfb40aa24bbb8153a677b98064d7";
//     // web3 = new Web3(rpc_url);

    
//     const provider = new ethers.providers.WebSocketProvider(rpc_url);
//     // ethers.providers.WebSocketProvider(rpc_url)
//     provider.on("block", async (blockNumber) => {
//       console.log("start");
//         const block = await provider.getBlockWithTransactions();
//         for (let tx of block.transactions) {
//             console.log(tx);
//         }
//     });

    // let contract = new web3.eth.Contract(abi, "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B");

    // contract.events.allEvents({
    //       fromBlock: 'latest'
    //     })
    //     .on("connected", function (subscriptionId) {
    //       console.log('WSS Connected');
    //       console.log(new Date().toLocaleString());
    //     })
    //     .on('data', function (result, error) {
    //       console.log('Event called');
    //       console.log(result);
    //     })
    //     .on('error', function (result, error) {
    //       console.log('Event error');
    //     })
    //     .on('close', function (result, error) {
    //       console.log('Event close');
    //       console.log(result);
    //     })
    //     .on('reconnect', function(data){
    //           console.log("On subscribe_bluk_address Reconnected: ",data);
    //      });
    }
    // for(let i = 0 ; i < json.data.pools.length; i++){
    //     let data = json.data.pools[i];
    //     var sql = "INSERT INTO `details`(`addresses`, `token0`, `token1`, `token0price`, `token1price`, `feetier`) VALUES ('" + data.id + "','" + data.token0.symbol + "','" + data.token1.symbol + "','" + data.token0Price + "','" + data.token1Price + "','" + data.feeTier + "')";
    //     db.query(sql);
    //     console.log(i);
    // }
