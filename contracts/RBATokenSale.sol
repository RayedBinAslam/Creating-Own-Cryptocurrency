pragma solidity >=0.4.2;

import "./RBAToken.sol";

contract RBATokenSale {
  //State variables
  address payable admin; //We don't want to expose the admin
  RBAToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  //Sell Event
  event Sell(address _buyer, uint256 _amount);

  constructor (RBAToken _tokenContract, uint256 _tokenPrice) public {
    //Assign an Admin
    admin = msg.sender;

    //Assign Token contract
    tokenContract = _tokenContract;

    //Token Price
    tokenPrice = _tokenPrice;
  }

  //Multiply function
  function multiply(uint x, uint y) internal pure returns (uint z){
    require(y == 0 || (z = x * y) / y == x);
  }
  //Buy Tokens function
  function buyTokens(uint256 _numberOfTokens) public payable {
    //Require that the amount is equal to tokens
    require(msg.value == multiply (_numberOfTokens, tokenPrice) );

    //Require that the contract has enough tokens - Provision tokens to token sale contract
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

    //Require that a transfer is successful
    require(tokenContract.transfer(msg.sender, _numberOfTokens));

    //Keep track of number of token sold - tokenSale
    tokensSold += _numberOfTokens;

    //Emit (Trigger) a Sell Event
    emit Sell(msg.sender, _numberOfTokens);
  }

  //Ending Token RBATokenSale
  function endSale() public {
    //Require that admin can do this only
    require(msg.sender == admin);

    //Transfer remaining RBATokens to admin
    require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

    // Just transfer the balance to the admin
    admin.transfer(address(this).balance);

    //Destroy the contract
    selfdestruct(msg.sender);
  }

}
