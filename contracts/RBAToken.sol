pragma solidity >=0.4.2;

contract RBAToken {
  string public name = "RBA Token";
  string public symbol = "RBA";
  string public standard = "RBA Token v1.0";
  uint256 public totalSupply;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value
    );
  mapping(address => uint256) public balanceOf;

  //Constructor
  constructor (uint256 _initialSupply) public {
      //Set the total number of tokens
      balanceOf[msg.sender] = _initialSupply;
      //Read the total number of tokens
      totalSupply = _initialSupply;
  }

  //Transfer Function
  function transfer(address _to, uint256 _value) public returns (bool success){
    //Exception if account doesn't have enough Ether
    require(balanceOf[msg.sender] >= _value);

    //Transfer the balance
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    //Transfer Event
    emit Transfer(msg.sender, _to, _value);

    //Return a boolean
    return true;
  }

}
