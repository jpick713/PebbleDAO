// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verify.sol";
import "./InsuranceNFT.sol";


contract InsuranceDAO is Ownable{

    mapping (uint256 => uint256) public costSchedule;//costs for each driver NFT
    Verify verifyContract; //verifying contract
    InsuranceNFT NFTInstance;//NFT contract

    constructor(address _verifyAddress){
        verifyContract = Verify(_verifyAddress);
    }

    function setCostSchedule(uint[] memory levels, uint[] memory costs) public onlyOwner{
        require(levels.length == costs.length, "arr lengths");
        for(uint8 i=0; i<levels.length; i++){
            if(levels[i]>=1 && levels[i] <= 5){
                costSchedule[levels[i]] = costs[i];
            }
        }
    }

    function setNFTContract(address payable NFTContract) public onlyOwner{
        NFTInstance = InsuranceNFT(NFTContract);
    } 
}