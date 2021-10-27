// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verify.sol";
import "./InsuranceNFT.sol";


contract InsuranceDAO is Ownable{

    mapping (uint256 => uint256) public costSchedule;//costs for each driver NFT
    uint256[][2] internal penaltyLevels; //penalty and acceleration levels
    Verify verifyContract; //verifying contract
    InsuranceNFT NFTInstance;//NFT contract

    constructor(address _verifyAddress){
        verifyContract = Verify(_verifyAddress);
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
        for (uint8 i=0; i<levels.length; i++){
            penaltyLevels[i][0] = levels[i];
            penaltyLevels[i][1] = penalties[i]; 
        }
    }

    function setNFTContract(address payable NFTContract) public onlyOwner{
        NFTInstance = InsuranceNFT(NFTContract);
    } 

    function getPenaltyLevels() public view returns(uint[][2] memory){
        return penaltyLevels;
    }
}