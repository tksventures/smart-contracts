pragma solidity >=0.4.22 <0.7.0;

library SafeMath {
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract CLPPSToken {
  string public constant name = "CLPPSToken";
  string public constant symbol = "CLPPS";
  uint8 public constant decimals = 18;
  address payable public clppsAdmin; // Address with privileges to mint new tokens

  constructor(uint256 total, address payable admin) public {
    clppsAdmin = admin;
    totalSupply_ = total;
    balances[msg.sender] = totalSupply_;
  }

  /****
  * ERC-20 Compliant Interface
  ****/
  event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
  event Transfer(address indexed from, address indexed to, uint tokens);

  mapping(address => uint256) balances;

  mapping(address => mapping (address => uint256)) allowed;

  uint256 totalSupply_;

  using SafeMath for uint256;

  function totalSupply() public view returns (uint256) {
	  return totalSupply_;
  }

  function balanceOf(address tokenOwner) public view returns (uint) {
    return balances[tokenOwner];
  }

  function transfer(address receiver, uint numTokens) public returns (bool) {
    require(numTokens <= balances[msg.sender], "Insufficient Tokens");
    balances[msg.sender] = balances[msg.sender].sub(numTokens);
    balances[receiver] = balances[receiver].add(numTokens);
    emit Transfer(msg.sender, receiver, numTokens);
    return true;
  }

  function approve(address delegate, uint numTokens) public returns (bool) {
    allowed[msg.sender][delegate] = numTokens;
    emit Approval(msg.sender, delegate, numTokens);
    return true;
  }

  function allowance(address owner, address delegate) public view returns (uint) {
    return allowed[owner][delegate];
  }

  function transferFrom(address owner, address buyer, uint numTokens) public returns (bool) {
    require(numTokens <= balances[owner], "Insufficient Tokens");
    require(numTokens <= allowed[owner][msg.sender], "That amount has not been approved");

    balances[owner] = balances[owner].sub(numTokens);
    allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
    balances[buyer] = balances[buyer].add(numTokens);
    emit Transfer(owner, buyer, numTokens);
    return true;
  }

  /****
  * Mint-and-Burn functionality
  ****/
  event Mint(address indexed to, uint tokens);
  event Burn(address indexed from, uint tokens);

  modifier onlyAdmin() {
    require(
      msg.sender == clppsAdmin,
      "Only the contract admin can call this function"
    );
    _;
  }

  function mint(address receiver, uint numTokens)
    public
    onlyAdmin
    returns (bool) {
      balances[receiver] = balances[receiver].add(numTokens);
      totalSupply_ = totalSupply_.add(numTokens);
      emit Mint(receiver, numTokens);
      return true;
  }

  function burn(address sender, uint numTokens)
    public
    returns (bool) {
      require(numTokens <= balances[sender], "Insufficient Tokens");

      balances[sender] = balances[sender].sub(numTokens);
      totalSupply_ = totalSupply_.sub(numTokens);
      emit Burn(sender, numTokens);
      return true;
  }
}
