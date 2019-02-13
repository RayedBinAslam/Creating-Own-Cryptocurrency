var RBAToken = artifacts.require("./RBAToken.sol");

contract('RBAToken', function(accounts){
  var tokenInstance;
    it('Initializes the contract with the correct values', function(){
      return RBAToken.deployed().then(function(instance) {
          tokenInstance = instance;
          return tokenInstance.name();
      }).then(function(name){
        assert.equal(name, 'RBA Token', 'Has the correct name');
        return tokenInstance.symbol();
      }).then(function(symbol){
        assert.equal(symbol, 'RBA', 'Has the correct symbol');
        return tokenInstance.standard();
      }).then(function(standard){
        assert.equal(standard, 'RBA Token v1.0', 'Has the correct standard');
      });
    });
    it('Sets the total supply upon deployment', function(){
        return RBAToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
          assert.equal(totalSupply.toNumber(), 1000000, 'Allocates the initial supply to 1,000,000');
          return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
          assert.equal(adminBalance.toNumber(), 1000000, 'It allocates the initial supply to the Admin account');
        });
    });

    it('Transfers token ownership', function(){
      return RBAToken.deployed().then(function(instance){
        tokenInstance = instance;
      //  Test require statement first by transferring something larger than the sender's balance
       //   return tokenInstance.transfer.call(accounts[1], 99999999999999999999999);
       // }).then(assert.fail).catch(function(error){
       //   assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
         return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
       }).then(function(success){
         assert.equal(success, true, 'it returns true');
         return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0]});
       }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
        return tokenInstance.balanceOf(accounts[1]);
      }).then(function(balance){
        assert.equal(balance.toNumber(), 250000, 'Adds the amount to the receiving account');
        return tokenInstance.balanceOf(accounts[0]);
      }).then(function(balance){
        assert.equal(balance.toNumber(), 750000, 'Deducts the amount from sending account');
      });
    });
});
