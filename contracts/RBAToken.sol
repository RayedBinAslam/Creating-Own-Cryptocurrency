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

  //Approval Event
  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
    );

  mapping(address => uint256) public balanceOf;
  //allowance
  mapping(address => mapping(address => uint256)) public allowance;



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

//Delegated function
//approve
  function approve(address _spender, uint256 _value) public returns (bool success) {
    //allowance
    allowance[msg.sender][_spender] = _value;

    //Approve Event
    emit Approval(msg.sender, _spender, _value);

    return true;
  }

  //transferfrom function
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
    //Require _from has enough tokens
    require(_value <= balanceOf[_from]);

    //Require allowance is big enough
    require(_value <= allowance[_from][msg.sender]);

    //Change the balance
    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;

    //Update the allowance
    allowance[_from][msg.sender] -= _value;

    //Transfer event
    emit Transfer(_from, _to, _value);

    //return a boolean
    return true;
  }








}
