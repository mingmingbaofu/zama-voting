// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title ConfidentialVoting
 * @dev 使用FHEVM实现的机密投票系统
 * @notice 这是一个为Zama Builder项目设计的机密投票合约
 */
contract ConfidentialVoting {
    // 投票选项结构
    struct VoteOption {
        string name;
        euint32 count;  // 加密的投票计数
    }
    
    // 投票活动结构
    struct VotingSession {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        VoteOption[] options;
        mapping(address => bool) hasVoted;
        mapping(address => euint8) votes;  // 加密的投票记录
        uint256 totalVoters;
        bool isActive;
    }
    
    // 状态变量
    mapping(uint256 => VotingSession) public votingSessions;
    uint256 public nextSessionId;
    address public admin;
    
    // 事件定义
    event VotingSessionCreated(
        uint256 indexed sessionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed sessionId,
        address indexed voter,
        uint256 timestamp
    );
    
    event VotingSessionEnded(
        uint256 indexed sessionId,
        uint256 endTime
    );
    
    // 修饰器
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }
    
    modifier validSession(uint256 sessionId) {
        require(sessionId < nextSessionId, "Session does not exist");
        _;
    }
    
    modifier activeSession(uint256 sessionId) {
        VotingSession storage session = votingSessions[sessionId];
        require(session.isActive, "Session is not active");
        require(block.timestamp >= session.startTime, "Session has not started");
        require(block.timestamp <= session.endTime, "Session has ended");
        _;
    }
    
    // 构造函数
    constructor() {
        admin = msg.sender;
        nextSessionId = 0;
    }
    
    /**
     * @dev 创建投票会话
     * @param title 投票标题
     * @param description 投票描述
     * @param duration 投票持续时间（秒）
     * @param optionNames 投票选项名称数组
     */
    function createVotingSession(
        string memory title,
        string memory description,
        uint256 duration,
        string[] memory optionNames
    ) external onlyAdmin returns (uint256) {
        require(optionNames.length > 1, "Must have at least 2 options");
        require(duration > 0, "Duration must be positive");
        
        uint256 sessionId = nextSessionId++;
        VotingSession storage session = votingSessions[sessionId];
        
        session.title = title;
        session.description = description;
        session.startTime = block.timestamp;
        session.endTime = block.timestamp + duration;
        session.totalVoters = 0;
        session.isActive = true;
        
        // 初始化投票选项
        for (uint256 i = 0; i < optionNames.length; i++) {
            session.options.push(VoteOption({
                name: optionNames[i],
                count: TFHE.asEuint32(0)
            }));
        }
        
        emit VotingSessionCreated(sessionId, title, session.startTime, session.endTime);
        return sessionId;
    }
    
    /**
     * @dev 投票（简化版本）
     * @param sessionId 投票会话ID
     * @param voteChoice 投票选择（明文）
     */
    function vote(
        uint256 sessionId,
        uint8 voteChoice
    ) external validSession(sessionId) activeSession(sessionId) {
        VotingSession storage session = votingSessions[sessionId];
        
        require(!session.hasVoted[msg.sender], "Already voted");
        require(voteChoice < session.options.length, "Invalid vote choice");
        
        // 将普通整数转换为加密整数
        euint8 encryptedVote = TFHE.asEuint8(voteChoice);
        
        // 记录投票
        session.votes[msg.sender] = encryptedVote;
        session.hasVoted[msg.sender] = true;
        session.totalVoters++;
        
        // 更新对应选项的计数
        session.options[voteChoice].count = TFHE.add(
            session.options[voteChoice].count,
            TFHE.asEuint32(1)
        );
        
        emit VoteCast(sessionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev 结束投票会话
     * @param sessionId 投票会话ID
     */
    function endVotingSession(uint256 sessionId) 
        external 
        onlyAdmin 
        validSession(sessionId) 
    {
        VotingSession storage session = votingSessions[sessionId];
        require(session.isActive, "Session already ended");
        
        session.isActive = false;
        emit VotingSessionEnded(sessionId, block.timestamp);
    }
    
    /**
     * @dev 获取投票会话信息
     * @param sessionId 投票会话ID
     */
    function getVotingSession(uint256 sessionId) 
        external 
        view 
        validSession(sessionId) 
        returns (
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 totalVoters,
            bool isActive,
            uint256 optionCount
        ) 
    {
        VotingSession storage session = votingSessions[sessionId];
        return (
            session.title,
            session.description,
            session.startTime,
            session.endTime,
            session.totalVoters,
            session.isActive,
            session.options.length
        );
    }
    
    /**
     * @dev 获取投票选项名称
     * @param sessionId 投票会话ID
     * @param optionIndex 选项索引
     */
    function getOptionName(uint256 sessionId, uint256 optionIndex) 
        external 
        view 
        validSession(sessionId) 
        returns (string memory) 
    {
        VotingSession storage session = votingSessions[sessionId];
        require(optionIndex < session.options.length, "Invalid option index");
        return session.options[optionIndex].name;
    }
    
    /**
     * @dev 检查地址是否已投票
     * @param sessionId 投票会话ID
     * @param voter 投票者地址
     */
    function hasVoted(uint256 sessionId, address voter) 
        external 
        view 
        validSession(sessionId) 
        returns (bool) 
    {
        return votingSessions[sessionId].hasVoted[voter];
    }
    
    /**
     * @dev 获取投票会话总数
     */
    function getTotalSessions() external view returns (uint256) {
        return nextSessionId;
    }
} 