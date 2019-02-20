var RBAToken = artifacts.require("./RBAToken.sol");
var RBATokenSale = artifacts.require("./RBATokenSale.sol");

contract ('RBATokenSale', function(accounts){
  var tokenInstance;
  var tokenSaleInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenPrice = 1000000000000000; // in WEI which is equal to 0.001 Ether
  var tokensAvailble = 750000;
  var numberOfTokens;

  it('Initializes the contract with the correct values', function(){
    return RBATokenSale.deployed().then(function(instance){
      tokenSaleInstance = instance;
      return tokenSaleInstance.address
    }).then(function(address){
      assert.notEqual(address, 0x0, 'has contract address');
      return tokenSaleInstance.tokenContract();
    }).then(function(address){
      assert.notEqual(address, 0x0, 'has token contract address');
      return tokenSaleInstance.tokenPrice();
    }).then(function(price){
      assert.equal(price, tokenPrice, 'token price is correct');
    });
  });

  it('Facilitates token buying', function(){
    return RBAToken.deployed().then(function(instance){
      //Grab token instance first
      tokenInstance = instance;
      return RBATokenSale.deployed();
    }).then(function(instance){
      //Then grab token sale instance
      tokenSaleInstance = instance;
      //Provision 75% tokens - Transfer some tokens from TOKEN CONTRACT to TOKEN SALE CONTRACT
      return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailble, { from: admin })
    }).then(function(receipt){

      numberOfTokens = 10;
      //Buy some tokens
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice})
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
      //Check for the numberOfTokens sold
      return tokenSaleInstance.tokensSold();
    }).then(function(amount){
      //Ensure that the numberOfTokens sold is the same amount which we have bought
      assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
      return tokenInstance.balanceOf(buyer);
      }).then(function(balance){
        assert.equal(balance.toNumber(), numberOfTokens);
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance){
      assert.equal(balance.toNumber(), tokensAvailble - numberOfTokens);
      //Try to buy tokens different from the Ether value
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in WEI');
    //   return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice });
    // }).then(assert.fail).catch(function(error){
    //   assert(error.message.indexOf('revert') >= 0, 'Cannot purchase more tokens than tokensAvailble');
  });

  });

  it('Ends Token Sale', function(){
    return RBAToken.deployed().then(function(instance){
      //Grab Token instance first
      tokenInstance = instance;
      return RBATokenSale.deployed();
    }).then(function(instance){
      //Then grab tokenSaleInstance
      tokenSaleInstance = instance;
      //Try to end sale from account other than the admin
      return tokenSaleInstance.endSale({ from: buyer });
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert' >=0, 'must be admin to endSale'));
      //End sale as Admin
      return tokenSaleInstance.endSale({ from: admin });
    }).then(function(receipt){
      return tokenInstance.balanceOf(admin);
      //return tokenInstance.endSale({ from: admin });
    }).then(function(balance){
      assert.equal(balance.toNumber(), 1000000, 'returns all unsold RBATokens to the Admin'); //change 1000000 to 999990
      //Check that token price was reset when SelfDestruct is called
      return tokenSaleInstance.tokenPrice();
    }).then(function(price){
      assert.equal(price.toNumber(), 0, 'Token price was reset');
    });
  });
    //   balance = web3.eth.getBalance(tokenSaleInstance.address)
    //     assert.equal(balance.toNumber(), 0, 'Token price is reset');
    //   });
    // });



});
