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



on 29/06
const { ethers } = require("ethers");
ABI = require("./abi.json");
Web3 = require("web3");

// 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 = USDC
// 0xdAC17F958D2ee523a2206206994597C13D831ec7 = USDT
// 0x0000000000085d4780B73119b644AE5ecd22b376 = TUSD
// 0x6B175474E89094C44Da98b954EedeAC495271d0F = DAI
// 0x4Fabb145d64652a948d72533023f6E7A623C7C53 = BUSD
// 0xB8c77482e45F1F44dE1745F52C74426C631bDD52 = BNB
// 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 = WETH
// 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84 = stETH
// 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599 = WBTC
// 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE = SHIB
// 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 = UNI
// 0x514910771AF9Ca656af840dff83E8264EcF986CA = LINK
// 0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32 = LDO

const HT = [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48n, 0xdAC17F958D2ee523a2206206994597C13D831ec7n,0x0000000000085d4780B73119b644AE5ecd22b376n,0x6B175474E89094C44Da98b954EedeAC495271d0Fn,0x4Fabb145d64652a948d72533023f6E7A623C7C53n,0xB8c77482e45F1F44dE1745F52C74426C631bDD52n,0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2n,0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84n,0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599n,0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cEn,0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984n,0x514910771AF9Ca656af840dff83E8264EcF986CAn,0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32n];
let rpc_url = "wss://eth-mainnet.nodereal.io/ws/v1/1659dfb40aa24bbb8153a677b98064d7";
const web3 = new Web3(rpc_url);

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
const universal_router = 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FADn;
let froms = [0];
let cnt = 0;

provider.on("block", async (blockNumber) => {
	console.log(blockNumber);
	
	let blockdata = await provider.getBlock();
	let trx = blockdata.transactions;
	let trxdata = await provider.getBlockWithTransactions();
	if(cnt == 0)
		await checkAddress(trx,trxdata, blockdata);
});

async function checkAddress(trx,trxdata,blockdata) {
	cnt++;
	for( let i=0; i<trx.length; i++){
		if(trxdata.transactions[i].to == universal_router) {
			try{
				var info = await trxdata.transactions[i].wait();
				for (let i = 0; i < info.logs.length; i++) {
					logs = info.logs[i];
					if(logs.data.length > 194){
						// console.log("pool = " , logs.address, "|| transaction = ", trxdata.transactions[i].hash);
						let response;
						let Contract;

						try{
							Contract = new web3.eth.Contract(ABI.V2POOL_ABI, logs.address);
							await Contract.methods.symbol().call().then(value => {response = value;});
							await Contract.methods.token0().call().then(value => {response = value;});
							
							// console.log("response in V2 = ", response);

							const found = HT.find(element => element == response);
							if(found == undefined){
								// console.log("found = ", response);
								froms.push(trxdata.transactions[i].from);
								console.log("V2 Pair token0 = ", response, "|| Swapper address = ", trxdata.transactions[i].from);
							}
						}catch (error) {
							Contract = new web3.eth.Contract(ABI.V3POOL_ABI, logs.address);
							await Contract.methods.token0().call().then(value => {response = value;});

							// console.log("response in V3 = ", response);

							const found = HT.find(element => element == response);
							if(found == undefined){
								// console.log("FOUND = ", response);
								froms.push(trxdata.transactions[i].from);
								console.log("V3 Pool token0 = ", response, "Swapper address = ", trxdata.transactions[i].from);
							}
						}
					}
				}
			} catch (error) {
				console.log("FAILED TRANSACTION = " ,trxdata.transactions[i].hash);
			}
		}
	}
	console.log("---------------------------------------------------------" );
	console.log(froms);
	let response2;
	// try {
		console.log("1 \n");
		let label = froms[2];
		console.log("2 \n", label);
		web3.eth.getPastLogs({
			fromBlock: blockdata.hash, address: label
		}).then(value => {response2 = value;});
		console.log("3 \n");
			console.log(response2);
			console.log("---------------------------------------------------------" );
	// 	} catch (error) {
	// 	console.log("/*/*/*/*/*/*/*/*/*/*/*/*/*/*/" );
	// }
	
		// web3.eth.getPastLogs({fromBlock: '0x16d94cff430e3cdffef433ddd718de4ba42a98ced10456261efd0fe4bec89bd4', address: label}).then(res => {
			// res.forEach(rec => /{
				// console.log("logs of label = ", rec.blockNumber, rec.transactionHash, rec.topics);
			// });
		
		// }).catch(err => console.log("/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/",));
}
