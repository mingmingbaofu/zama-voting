// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint8, ebool, externalEuint8, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEVoting is SepoliaConfig {
    struct Poll {
        string title;
        string description;
        string[] options;
        euint32[] encCounts; // encrypted counts
        mapping(address => bool) hasVoted; // voter => has voted
        uint256 endTime;
        bool isActive;
        address creator;
        bool pendingDecrypt;
        uint256 latestRequestId;
    }

    mapping(uint256 => Poll) public polls;
    mapping(uint256 => uint256) public requestIdToPollId; // 关联requestId到pollId
    uint256 public pollCount;
    
    event PollCreated(uint256 indexed pollId, string title, address creator);
    event VoteCast(uint256 indexed pollId, address voter);
    event PollEnded(uint256 indexed pollId);
    event ResultsRequested(uint256 indexed pollId, uint256 requestId);
    event ResultsDecrypted(uint256 indexed pollId, uint256 requestId, uint32[] counts);

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
            euint32 zeroCount = FHE.asEuint32(0);
            newPoll.encCounts.push(zeroCount);
            FHE.allowThis(zeroCount);
        }

        emit PollCreated(pollId, title, msg.sender);
        return pollId;
    }

    function vote(uint256 pollId, externalEuint8 encryptedChoice, bytes calldata inputProof) 
        external 
        onlyActivePoll(pollId) 
    {
        Poll storage poll = polls[pollId];
        
        require(!poll.hasVoted[msg.sender], "already voted");
        
        // Convert input to encrypted uint8 (should be 1 for the selected option)
        euint8 choice = FHE.fromExternal(encryptedChoice, inputProof);

        for (uint256 i = 0; i < poll.options.length; i++) {
            ebool isI = FHE.eq(choice, FHE.asEuint8(uint8(i)));
            euint32 inc = FHE.select(isI, FHE.asEuint32(1), FHE.asEuint32(0));
            poll.encCounts[i] = FHE.add(poll.encCounts[i], inc);
            FHE.allowThis(poll.encCounts[i]);
        }
        
        // Mark user as having voted
        poll.hasVoted[msg.sender] = true;
        
        emit VoteCast(pollId, msg.sender);
    }

    function endPoll(uint256 pollId) external onlyPollCreator(pollId) {
        polls[pollId].isActive = false;
        emit PollEnded(pollId);
    }

    function requestResults(uint256 pollId) external onlyPollCreator(pollId) returns (uint256) {
        require(!polls[pollId].isActive || block.timestamp >= polls[pollId].endTime, "Poll is still active");
        require(!polls[pollId].pendingDecrypt, "pending");

        Poll storage poll = polls[pollId];
        bytes32[] memory cts = new bytes32[](poll.options.length);
        
        for (uint256 i = 0; i < poll.options.length; i++) {
            cts[i] = FHE.toBytes32(poll.encCounts[i]);
        }
        
        poll.latestRequestId = FHE.requestDecryption(
            cts,
            this.callbackResults.selector
        );
        
        // 建立requestId到pollId的映射
        requestIdToPollId[poll.latestRequestId] = pollId;
        
        emit ResultsRequested(pollId, poll.latestRequestId);
        poll.pendingDecrypt = true;
        return poll.latestRequestId;
    }

    // 回调函数处理解密结果
    function callbackResults(
        uint256 requestId, uint32[] memory counts, bytes[] memory signatures
    ) external {
        // 通过requestId找到对应的pollId
        uint256 pollId = requestIdToPollId[requestId];
        require(pollId < pollCount, "Invalid poll");
        
        Poll storage poll = polls[pollId];
        require(requestId == poll.latestRequestId, "Invalid requestId");
        require(poll.pendingDecrypt, "No pending decryption");
        
        FHE.checkSignatures(requestId, signatures);
        
        // 处理解密后的投票结果
        require(counts.length == poll.options.length, "Counts length mismatch");
        
        // 清除待解密状态
        poll.pendingDecrypt = false;
        
        // 可以在这里添加事件来通知前端结果已准备好
        emit ResultsDecrypted(pollId, requestId, counts);
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

    function getPollStatus(uint256 pollId) external view returns (
        bool pendingDecrypt,
        uint256 latestRequestId
    ) {
        Poll storage poll = polls[pollId];
        return (
            poll.pendingDecrypt,
            poll.latestRequestId
        );
    }
}
