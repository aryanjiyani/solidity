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



// listen from uniswap router

const { ethers } = require("ethers");
ABI = require("./abi.json");
Web3 = require("web3");

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
provider.on("block", async (blockNumber) => {
	console.log("start");
	console.log(blockNumber);
	
	let blockdata = await provider.getBlock();
	let trx = blockdata.transactions;
	let trxdata = await provider.getBlockWithTransactions();
	await checkAddress(trx,trxdata);
});

async function checkAddress(trx,trxdata){
	try {
		for( let i=0; i<trx.length; i++){
	
			let Uniroputer = 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FADn;
			if(trxdata.transactions[i].to == Uniroputer) {
				
				var info = await trxdata.transactions[i].wait();
	
				// console.log(i, " router ", info.logs);
				
				for (let i = 0; i < info.logs.length; i++) {
					logs = info.logs[i];
					if(logs.data.length > 194){

						let getpool = logs.address;
						console.log("pool = " , getpool);
						let rpc_url = "wss://eth-mainnet.nodereal.io/ws/v1/1659dfb40aa24bbb8153a677b98064d7";
    					web3 = new Web3(rpc_url);
						try {
							 await getv2amount(getpool);
							// console.log("actual in V2 = ", result);
						} catch (error) {
							 await getv3amount(getpool);
							// console.log("actual in V3= ", result);
						}
					}
				}
			}
		}
	} catch (error) {
		console.log("**********error***********");
	}
}

async function getv2amount(getpool) {
	console.log('V2 start');
    let V2Pool = new web3.eth.Contract(ABI.V2POOL_ABI, getpool);
	// console.log(await V2Pool.methods.price0CumulativeLast());
	// let response;
	// await V2Pool.methods.price0CumulativeLast().call().then(value => {response = value;})
	// console.log("price from v2 = ", response);
	// return response;
	let router_contract = new web3.eth.Contract(ABI.V2ROUTER_ABI, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
    let amount = 1;
    let path = ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"];
    let response = await router_contract.methods.getAmountsOut(amount, path).call();
    console.log(await response);
}

async function getv3amount(getpool) {
	console.log('V3 start');
    let V3pool = new web3.eth.Contract(ABI.V2POOL_ABI, getpool);
	let response;
	await V3pool.methods.slot0().call().then(value => {response = value;})
	console.log("price from v3 = ", await response.tick);
}





// for( let i=0; i<trx.length; i++){
// 	let fromcode = await provider.getCode(trxdata.transactions[i].from);
// 	let tocode = await provider.getCode(trxdata.transactions[i].to);
// 	if(fromcode > 0)
// 		console.log(i," from ", trxdata.transactions[i].from )
	
// 	if(tocode > 0)
// 		console.log(i," to ", trxdata.transactions[i].to )
// }




// async function uniswap() {
//   let rpc_url = "wss://eth-mainnet.nodereal.io/ws/v1/1659dfb40aa24bbb8153a677b98064d7";
  
//   const provider = new ethers.providers.WebSocketProvider(rpc_url);
//   const Contract = new ethers.Contract("0x1F98431c8aD98523631AE4a59f267346ea31F984",ABI.FACTORY_ABI, provider);
//   Contract.on("PoolCreated", (from, to, value, event) => {
//     let info = {
//       from: from,
//       to: to,
//       value: value,
//       eventData: event,
//     }
//     console.log("data = ", JSON.stringify(info, null, 4))
//   });
// }
// uniswap();
