// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verify.sol";
import "./InsuranceNFT.sol";


contract InsuranceDAO is Ownable{
    using Counters for Counters.Counter;
    
    Counters.Counter private _round;

    mapping (uint256 => uint256) public costSchedule;//costs for each driver NFT
    uint public payoutCap = 0.5 ether;//payout cap per block
    uint256[] internal penaltyLevels; //penalty and acceleration levels
    uint256[] internal accLevels; //levels acceleration where penalites occur
    mapping (uint => mapping (address => uint)) public roundBalances; //deposit minus any payouts in current round
    mapping (address => uint) public levelsEntered;//level of each driver originally
    Verify verifyContract; //verifying contract
    InsuranceNFT NFTInstance;//NFT contract

    constructor(address _verifyAddress){
        verifyContract = Verify(_verifyAddress);
        _round.increment();
    }

    receive() payable external{

    }

    function setCostSchedule(uint[] memory levels, uint[] memory costs) public onlyOwner{
        require(levels.length == costs.length, "arr lengths");
        for(uint8 i=0; i<levels.length; i++){
            if(levels[i]>=1 && levels[i] <= 5){
                costSchedule[levels[i]] = costs[i];
            }
        }
    }

    function setPenalties(uint[] memory levels, uint[] memory penalties) public onlyOwner{
        require(levels.length == penalties.length, "arr lengths");
        uint[] memory tempLevels = new uint[](levels.length);
        uint[] memory tempPenalties = new uint[](levels.length);

        for (uint8 i=0; i<levels.length; i++){
            tempLevels[i] = levels[i];
            tempPenalties[i] = penalties[i]; 
        }
        accLevels = tempLevels;
        penaltyLevels = tempPenalties;
    }

    function setNFTContract(address payable NFTContract) public onlyOwner{
        NFTInstance = InsuranceNFT(NFTContract);
    } 

    function getPenaltyLevels() public view returns(uint[] memory){
        return penaltyLevels;
    }

    function getAccLevels() public view returns(uint[] memory){
        return accLevels;
    }

    function getCurrentRound() public view returns(uint){
        uint currentRound = _round.current();
        return currentRound;
    }
}