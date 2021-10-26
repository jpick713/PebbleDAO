// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verify.sol";

contract InsuranceNFT is ERC721URIStorage, Ownable{
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;

    
    address payable internal DAOContract;//DAO contract address
    Verify verifyContract; //address of verifying contract
    
    uint private whiteListNumber;// number of whiteListed addresses
    //string public baseURI; //the base URI
    mapping (address => uint) public lastBlockNumberUpdate; // track mint/update of NFTs per address;
    mapping (address => uint[]) internal tokensByAddress;//track all NFTs owned by a user

    uint public currentTokenIdMax; // for ease of access public call

    event NFTMinted(address indexed _to, string indexed _tokenURI);
    event ReceiveCalled(address _caller, uint _value);
    
    

    constructor(address _verifyAddress, address payable _DAOAddress) ERC721("IoTex Insurance", "IOTXI") public{
        verifyContract = Verify(_verifyAddress);
        DAOContract = _DAOAddress;
    }

    receive() external payable {
        emit ReceiveCalled(msg.sender, msg.value);
    }

    function mintTokens(string memory _tokenURI, bytes32 r, bytes32 s, uint8 v) public {  
        require(verifyContract.metaDataVerify(_msgSender(), _tokenURI, 0, r, s, v), "not verified");
        uint256 newItemId;
        _tokenIds.increment();
        newItemId = _tokenIds.current(); 
        
        _mint(_msgSender(), newItemId);
        _setTokenURI(newItemId, _tokenURI);
        lastBlockNumberUpdate[_msgSender()] = block.number;
        tokensByAddress[_msgSender()].push(newItemId);
        currentTokenIdMax = newItemId;
        emit NFTMinted(msg.sender, _tokenURI);
    }

    function updateTokenURI(uint _tokenId, string memory _newTokenURI, bytes32 r, bytes32 s, uint8 v) public {
        require(_msgSender()== ownerOf(_tokenId), "not token owner");
        //call verify(_msgSender(), _tokenURI, tokenId)
        require(verifyContract.metaDataVerify(_msgSender(), _newTokenURI, _tokenId, r, s, v), "not verified");
        _setTokenURI(_tokenId, _newTokenURI);
        lastBlockNumberUpdate[_msgSender()] = block.number;
    }

    function setDAOContract(address payable _DAOAddress) public onlyOwner{
        DAOContract = _DAOAddress;
    }

    function getTokensByAddr(address tokenAddress) public view returns(uint[] memory){
        return tokensByAddress[tokenAddress];
    }

    function withdrawToWallet() public onlyOwner{
        transferToWallet();
    }

    function transferToWallet() internal {
        (bool success,) = owner().call{value : address(this).balance}("");
        require(success, "transaction not completed");
    }
}