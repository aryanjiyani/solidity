Web3 = require('web3');
const ABI = require("./abi.json");

// getAmountsOut();
// async function getAmountsOut() {
    
//     console.log('getAmountsOut');
    
//     let rpc_url = "wss://eth-mainnet.nodereal.io/ws/v1/1659dfb40aa24bbb8153a677b98064d7";
//     web3 = new Web3(rpc_url);
    
//     let router_contract = new web3.eth.Contract(ABI.CONTRACT_ABI, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
    
//     let amount = 1818;
//     let path = ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"];
//     let response;
//     response = await router_contract.methods.getAmountsOut(amount, path).call();
    
//     console.log(await response);
//     return response;
// }

getV3Amount();
async function getV3Amount() {
    console.log('getV3Amount');
    
    let rpc_url = "wss://eth-mainnet.nodereal.io/ws/v1/1659dfb40aa24bbb8153a677b98064d7";
    web3 = new Web3(rpc_url);
    let V3pool = new web3.eth.Contract(ABI.POOL_ABI, "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640");
    
    let response;
    let sqrtPriceX96;
    let price;
    await V3pool.methods.slot0().call()
    .then(value => {
        response = value;
    })
    .catch(error => {
        console.error('Failed to read myVariable:', error);
    });

    console.log(await response.sqrtPriceX96);
    sqrtPriceX96 = response.sqrtPriceX96;
    price = (sqrtPriceX96/(2**96))*(sqrtPriceX96/(2**96));
    console.log("tokenA = ", price/10**12);
    console.log("TokenB = ", 1/(price/10**12));
}
