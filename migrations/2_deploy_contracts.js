var RBAToken = artifacts.require("./RBAToken.sol");
var RBATokenSale = artifacts.require("./RBATokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(RBAToken, 1000000).then(function(){

      var tokenPrice = 1000000000000000; // in WEI which is equal to 0.001 Ether
    return  deployer.deploy(RBATokenSale, RBAToken.address, tokenPrice);
  });
};
