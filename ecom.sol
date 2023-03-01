// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract Ecommerce {
    
    address public merchant;
    address public admin;
    uint256 public fees; // percentage
    uint256 public feesPaidBy; // 1 for buyer & 2 for merchant
    mapping(address => uint256) public token;
    uint256 public tokenNumber=1;
    enum Status { 
        NotExist, 
        Initiated, 
        CancelbyMerchant, 
        CancelbyBuyer
    }
    struct Order {
        address buyer;
        uint256 price;
        uint256 charge;
        address currency;
        Status status;
    }
    mapping(string => Order) public orders;
    string public orderId;
    uint256 public numOrders;
    
    event newOrder (string orderId, uint256 price, address buyer, Status status);
    event Token (address token, uint256 tokenNumber);
    event Claimed (string orderId, uint256 price, Status status);
    event Canceled (string orderId, uint256 price, Status status);
    
    constructor(address _admin, uint256 _fees, uint256 _feesPaidBy) {
        admin = _admin;
        fees = _fees;
        feesPaidBy = _feesPaidBy;
        merchant = msg.sender;
    }
    modifier onlyMerchant() {
        require(msg.sender == merchant, "You are not merchant");
        _;
    }
    
    function addCurrency(address _token) external onlyMerchant{
        token[_token] = tokenNumber;
        emit Token (_token, tokenNumber);
        tokenNumber++;
    }
    function delCurrency(address _token) external onlyMerchant {
        token[_token] = 0;
        emit Token (_token, token[_token]);
    }

// For Other TOKENs
    function createOrderbyToken(address _token, uint256 _orderAmount, string memory _orderId) external {
        require(token[_token] != 0 && orders[_orderId].price == 0, "This token or orderID is not supported");        
        Order storage thisOrder = orders[_orderId];

        (bool success, bytes memory data) = _token.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), _orderAmount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "ERROR : can't transfer");

        thisOrder.buyer = msg.sender;
        thisOrder.price = _orderAmount;
        thisOrder.charge = _orderAmount*fees/100;
        thisOrder.currency = _token;
        thisOrder.status = Status.Initiated;
        numOrders++;
        emit newOrder (_orderId, _orderAmount, msg.sender, thisOrder.status);
    }
// For ETH only
    function createOrder(string memory _orderId) external payable {
        require(orders[_orderId].price == 0, "This orderId is already taken");
        Order storage thisOrder = orders[_orderId];
        thisOrder.buyer = msg.sender;
        thisOrder.price = msg.value;
        thisOrder.charge = msg.value*fees/100;
        thisOrder.currency = address(0);
        thisOrder.status = Status.Initiated;
        numOrders++;
        emit newOrder (_orderId, msg.value, msg.sender, thisOrder.status);        
    }

    function claim(string memory _orderId) external onlyMerchant {
        Order storage thisOrder = orders[_orderId];
        require (thisOrder.status==Status.Initiated && thisOrder.price!=0, "This order can not be claimed");
        
        uint256 toMerchant = thisOrder.price - thisOrder.charge;
        if(token[thisOrder.currency] != 0) {
            (bool success, bytes memory data) = thisOrder.currency.call(abi.encodeWithSignature("transfer(address,uint256)", merchant, toMerchant));
            require(success && (data.length == 0 || abi.decode(data, (bool))), "ERROR : can't transfer");
            (bool cool, bytes memory info) = thisOrder.currency.call(abi.encodeWithSignature("transfer(address,uint256)", admin, thisOrder.charge));
            require(cool && (info.length == 0 || abi.decode(info, (bool))), "ERROR : can't transfer");

            emit Claimed (_orderId, thisOrder.price, thisOrder.status);
        }else if(thisOrder.currency == address(0)) {
            address payable seller = payable(merchant);
            seller.transfer(toMerchant);
            address payable boss = payable(admin);
            boss.transfer(thisOrder.charge);
    
            emit Claimed (_orderId, thisOrder.price, thisOrder.status);
        }else {
            revert("Invalid order");
        }
    }
    
    function cancelOrder(string memory _orderId) external {
        require(orders[_orderId].price != 0 , "This Order does not exist");
        Order storage thisOrder = orders[_orderId];
        require(thisOrder.status==Status.Initiated && (msg.sender==merchant || msg.sender==thisOrder.buyer), "Order can not be canceled");
        
        uint256 toBuyer = thisOrder.price - thisOrder.charge;
        if(token[thisOrder.currency] != 0) {
            if(msg.sender == merchant) {
                (bool success, bytes memory data) = thisOrder.currency.call(abi.encodeWithSignature("transfer(address,uint256)", thisOrder.buyer, thisOrder.price));
                require(success && (data.length == 0 || abi.decode(data, (bool))), "ERROR : can't transfer");
                thisOrder.status= Status.CancelbyMerchant;
                numOrders--;
                emit Canceled (_orderId, thisOrder.price, thisOrder.status);
            }
            else {
                (bool success, bytes memory data) = thisOrder.currency.call(abi.encodeWithSignature("transfer(address,uint256)", thisOrder.buyer, toBuyer));
                require(success && (data.length == 0 || abi.decode(data, (bool))), "ERROR : can't transfer");
                (bool cool, bytes memory info) = thisOrder.currency.call(abi.encodeWithSignature("transfer(address,uint256)", admin, thisOrder.charge));
                require(cool && (info.length == 0 || abi.decode(info, (bool))), "ERROR : can't transfer");
                thisOrder.status= Status.CancelbyBuyer;
                numOrders--;
                emit Canceled (_orderId, thisOrder.price, thisOrder.status);
            }
        }else if(thisOrder.currency == address(0)) {
            address payable user = payable(thisOrder.buyer);
            if(msg.sender == merchant) {
                user.transfer(thisOrder.price);
                thisOrder.status= Status.CancelbyMerchant;
                numOrders--;
                emit Canceled (_orderId, thisOrder.price, thisOrder.status);
            }
            else {
                address payable boss = payable(admin);
                user.transfer(toBuyer);
                boss.transfer(thisOrder.charge);
                thisOrder.status= Status.CancelbyBuyer;
                numOrders--;
                emit Canceled (_orderId, thisOrder.price, thisOrder.status);
            }
        }else {
            revert ("invalid order");
        }
    }
    function getBalance(address _adreess) public view returns (uint256) {
        return _adreess.balance;
    }
}
