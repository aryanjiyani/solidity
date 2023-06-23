Web3 = require("web3");
ethers = require("ethers");

// await main();

// async function main() {
//   return true;
// }

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
provider.on("block", async (blockNumber) => {

  console.log("start");
  console.log(blockNumber);

  let blockdata = await provider.getBlock();
  let trxdata = await provider.getBlockWithTransactions();
  let trx = await blockdata.transactions;

  // trx.forEach(async (trxEle) => {
  // });

  for( let i=0; i<trx.length; i++){
    let fromcode = await provider.getCode(trxdata.transactions[i].from);
    let tocode = await provider.getCode(trxdata.transactions[i].to);
    console.log(i,trxdata.transactions[i].hash,trxdata.transactions[i].from,trxdata.transactions[i].to)
    console.log("address = ", fromcode > 0 ? trxdata.transactions[i].from : 
        tocode > 0 ? trxdata.transactions[i].to : trxdata.transactions[i].hash)

    // if(fromcode > 0) 
    //   console.log("--> from is contract = ", trxdata.transactions[i].from);
    // else 
    //   console.log("from is not contract");
    // if(tocode > 0) 
    //   console.log("--> to is contract = ", trxdata.transactions[i].to );
    // else 
    //   console.log("to is not contract");

  }
});
