// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verify.sol";
import "./InsuranceNFT.sol";


contract InsuranceDAO is Ownable{

    enum DriverRating{POOR, FAIR, GOOD, GREAT, PRISTINE}
    bytes32[5] internal ratingBytes = [keccak256("POOR"), keccak256("FAIR"), keccak256("GOOD"), keccak256("GREAT"), keccak256("PRISTINE")];//hashes of all the ratings 
    mapping (DriverRating => uint) public costSchedule;//costs for each driver NFT
    Verify verifyContract; //verifying contract
    InsuranceNFT NFTInstance;//NFT contract

    constructor(address _verifyAddress, address payable NFTAddress){
        verifyContract = Verify(_verifyAddress);
        NFTInstance = InsuranceNFT(NFTAddress);
    }
}