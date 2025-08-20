// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEVoting is SepoliaConfig {
    struct Poll {
        string title;
        string description;
        string[] options;
        mapping(uint256 => euint32) votes; // optionId => encrypted vote count
        mapping(address => ebool) hasVoted; // voter => has voted
        uint256 endTime;
        bool isActive;
        address creator;
    }

    mapping(uint256 => Poll) public polls;
    uint256 public pollCount;
    uint256 latestRequestId;
    
    event PollCreated(uint256 indexed pollId, string title, address creator);
    event VoteCast(uint256 indexed pollId, address voter);
    event PollEnded(uint256 indexed pollId);
    event ResultsRequested(uint256 indexed pollId, uint256 requestId);

    modifier onlyActivePoll(uint256 pollId) {
        require(polls[pollId].isActive, "Poll is not active");
        require(block.timestamp < polls[pollId].endTime, "Poll has ended");
        _;
    }

    modifier onlyPollCreator(uint256 pollId) {
        require(polls[pollId].creator == msg.sender, "Only poll creator can perform this action");
        _;
    }

    function createPoll(
        string memory title,
        string memory description,
        string[] memory options,
        uint256 duration
    ) external returns (uint256) {
        require(options.length >= 2, "Poll must have at least 2 options");
        require(options.length <= 10, "Poll cannot have more than 10 options");
        require(duration > 0, "Duration must be positive");

        uint256 pollId = pollCount++;
        Poll storage newPoll = polls[pollId];
        
        newPoll.title = title;
        newPoll.description = description;
        newPoll.options = options;
        newPoll.endTime = block.timestamp + duration;
        newPoll.isActive = true;
        newPoll.creator = msg.sender;

        // Initialize encrypted vote counts to 0
        for (uint256 i = 0; i < options.length; i++) {
            newPoll.votes[i] = FHE.asEuint32(0);
        }

        emit PollCreated(pollId, title, msg.sender);
        return pollId;
    }

    function vote(uint256 pollId, uint256 optionId, externalEuint32 encryptedVote, bytes calldata inputProof) 
        external 
        onlyActivePoll(pollId) 
    {
        Poll storage poll = polls[pollId];
        require(optionId < poll.options.length, "Invalid option");
        
        // Check if user has already voted (this will be encrypted)
        ebool hasVoted = poll.hasVoted[msg.sender];
        ebool canVote = FHE.not(hasVoted);
        
        // Convert input to encrypted uint32 (should be 1 for the selected option)
        euint32 voteVal = FHE.fromExternal(encryptedVote, inputProof);

        // Only add vote if user hasn't voted before
        euint32 validVote = FHE.select(canVote, voteVal, FHE.asEuint32(0));
        poll.votes[optionId] = FHE.add(poll.votes[optionId], validVote);
        
        // Mark user as having voted
        poll.hasVoted[msg.sender] = FHE.asEbool(true);
        
        emit VoteCast(pollId, msg.sender);
    }

    function endPoll(uint256 pollId) external onlyPollCreator(pollId) {
        polls[pollId].isActive = false;
        emit PollEnded(pollId);
    }

    function requestResults(uint256 pollId) external onlyPollCreator(pollId) returns (uint256) {
        require(!polls[pollId].isActive || block.timestamp >= polls[pollId].endTime, "Poll is still active");
        
        Poll storage poll = polls[pollId];
        bytes32[] memory encryptedResults = new bytes32[](poll.options.length);
        
        for (uint256 i = 0; i < poll.options.length; i++) {
            encryptedResults[i] = FHE.toBytes32(poll.votes[i]);
        }
        
        latestRequestId = FHE.requestDecryption(
            encryptedResults,
            this.callbackResults.selector
        );
        
        emit ResultsRequested(pollId, latestRequestId);
        return latestRequestId;
    }

    // I don’t know how to define the function because the number of votes in the Pool is uncertain.
    function callbackResults(
        uint256 requestId, bytes[] memory signatures
    ) external {
        require(requestId == latestRequestId, "Invalid requestId");
        FHE.checkSignatures(requestId, signatures);
    }

    function getPollInfo(uint256 pollId) external view returns (
        string memory title,
        string memory description,
        string[] memory options,
        uint256 endTime,
        bool isActive,
        address creator
    ) {
        Poll storage poll = polls[pollId];
        return (
            poll.title,
            poll.description,
            poll.options,
            poll.endTime,
            poll.isActive,
            poll.creator
        );
    }
}
