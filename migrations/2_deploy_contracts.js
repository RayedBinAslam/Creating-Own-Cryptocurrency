var RBAToken = artifacts.require("./RBAToken.sol");

module.exports = function(deployer) {
  deployer.deploy(RBAToken, 1000000);
};
