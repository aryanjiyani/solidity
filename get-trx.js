const { ethers } = require("ethers");
ABI = require("./abi.json");
Web3 = require("web3");


const HT = [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48n, 0xdAC17F958D2ee523a2206206994597C13D831ec7n, 0x0000000000085d4780B73119b644AE5ecd22b376n, 0x6B175474E89094C44Da98b954EedeAC495271d0Fn, 0x4Fabb145d64652a948d72533023f6E7A623C7C53n, 0xB8c77482e45F1F44dE1745F52C74426C631bDD52n, 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2n, 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84n, 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599n, 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cEn, 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984n, 0x514910771AF9Ca656af840dff83E8264EcF986CAn, 0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32n];
let rpc_url = "wss://eth-mainnet.nodereal.io/ws/v1/1659dfb40aa24bbb8153a677b98064d7";
const web3 = new Web3(rpc_url);

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
const universal_router = 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FADn;
let froms = [];
let cnt = 0;

provider.on("block", async (blockNumber) => {
	console.log(blockNumber);

	let blockdata = await provider.getBlock();
	let trx = blockdata.transactions;
	let trxdata = await provider.getBlockWithTransactions();
	if (cnt == 0)
		await checkAddress(trx, trxdata)[0];
});

async function checkAddress(trx, trxdata) {
	cnt++;
	for (let i = 0; i < trx.length; i++) {
		if (trxdata.transactions[i].to == universal_router) {
			try {
				var info = await trxdata.transactions[i].wait();
				for (let i = 0; i < info.logs.length; i++) {
					logs = info.logs[i];
					if (logs.data.length > 194) {
						// console.log("pool = " , logs.address, "|| transaction = ", trxdata.transactions[i].hash);
						let response;
						let response2;
						let Contract;

						try {
							Contract = new web3.eth.Contract(ABI.V2POOL_ABI, logs.address);
							await Contract.methods.symbol().call().then(value => { response = value; });
							await Contract.methods.token0().call().then(value => { response = value; });
							await Contract.methods.token1().call().then(value => { response2 = value; });
														
							let found = HT.find(element => element == response);
							let found2 = HT.find(element => element == response2);
							if (found == undefined || found2 == undefined) {
								froms.push(trxdata.transactions[i].from);
								console.log("V2 Pair Token0 = ", response, "V2 Pair Token1 = ", response2, "from = ", trxdata.transactions[i].from);
							}
						} catch (error) {
							Contract = new web3.eth.Contract(ABI.V3POOL_ABI, logs.address);
							await Contract.methods.token0().call().then(value => { response = value; });
							await Contract.methods.token1().call().then(value => { response2 = value; });
							
							let found = HT.find(element => element == response);
							let found2 = HT.find(element => element == response);
							if (found == undefined) {
								froms.push(trxdata.transactions[i].from);
								console.log("V3 Pool Token0 = ", response, "V3 Pool Token1 = ", response2, "from = ", trxdata.transactions[i].from);
							}
						}
					}
				}
			} catch (error) {
				console.log("FAILED TRANSACTION = ", trxdata.transactions[i].hash);
			}
		}
	}
	console.log(froms);
	await gettrx(froms);
}

async function gettrx(froms) {
	let options = {
		topics: [
			web3.utils.sha3('Transfer(address,address,uint256)')
		]
	};
	
	const abi = [
		{
			"constant": true,
			"inputs": [],
			"name": "symbol",
			"outputs": [
				{
					"name": "",
					"type": "string"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [],
			"name": "decimals",
			"outputs": [
				{
					"name": "",
					"type": "uint8"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		}
	];
	
	let subscription = web3.eth.subscribe('logs', options);
	
	async function collectData(contract) {
		const [decimals, symbol] = await Promise.all([
			contract.methods.decimals().call(),
			contract.methods.symbol().call()
		]);
		return { decimals, symbol };
	}	
		
	subscription.on('data', event => {
		if (event.topics.length == 3) {
			let transaction = web3.eth.abi.decodeLog([{
				type: 'address',
				name: 'from',
				indexed: true
			}, {
				type: 'address',
				name: 'to',
				indexed: true
			}, {
				type: 'uint256',
				name: 'value',
				indexed: false
			}],
			event.data,
			[event.topics[1], event.topics[2], event.topics[3]]);

			const contract = new web3.eth.Contract(abi, event.address)
			
			collectData(contract).then(contractData => {
				const unit = Object.keys(web3.utils.unitMap).find(key => web3.utils.unitMap[key] === web3.utils.toBN(10).pow(web3.utils.toBN(contractData.decimals)).toString());
				console.log(`Transfer of ${web3.utils.fromWei(transaction.value, unit)} ${contractData.symbol} 
				from ${transaction.from} to ${transaction.to}`)
				
				if (transaction.from == froms[0]) { console.log('Specified address sent an ERC-20 token!') };
				if (transaction.from == froms[1]) { console.log('Specified address sent an ERC-20 token!') };
				if (transaction.from == froms[2]) { console.log('Specified address sent an ERC-20 token!') };
				if (transaction.from == froms[3]) { console.log('Specified address sent an ERC-20 token!') };
				// if (transaction.to == '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD') { console.log('Specified address received an ERC-20 token!') };
				// if (transaction.from == '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' && event.address == '0x6b175474e89094c44da98b954eedeac495271d0f') { console.log('Specified address transferred specified token!') };
				// if (event.address == '0x6b175474e89094c44da98b954eedeac495271d0f') { console.log('Specified ERC-20 transfer!') };  // event.address contains the contract address  
			})
		}
	});

	subscription.on('error', err => { throw err });
	subscription.on('connected', nr => console.log('Subscription on ERC-20 started with ID %s', nr));
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
