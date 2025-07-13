// 应用程序状态
let web3;
let userAccount;
let contract;
let signer;
let isAdmin = false;
let votingSessions = [];
let selectedSessionId = null;

// DOM 元素
const elements = {
    connectWallet: document.getElementById('connectWallet'),
    accountAddress: document.getElementById('accountAddress'),
    networkName: document.getElementById('networkName'),
    accountBalance: document.getElementById('accountBalance'),
    loading: document.getElementById('loading'),
    adminPanel: document.getElementById('adminPanel'),
    sessionsList: document.getElementById('sessionsList'),
    currentSession: document.getElementById('currentSession'),
    voteOptions: document.getElementById('voteOptions'),
    statusMessage: document.getElementById('statusMessage'),
    transactionStatus: document.getElementById('transactionStatus')
};

// 工具函数
const utils = {
    showLoading(message = "处理中，请稍候...") {
        const loadingEl = elements.loading;
        if (loadingEl) {
            const loadingText = loadingEl.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
            loadingEl.classList.add('show');
        }
    },
    
    hideLoading() {
        if (elements.loading) {
            elements.loading.classList.remove('show');
        }
    },
    
    formatAddress(address) {
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    },
    
    formatBalance(balance) {
        return `${parseFloat(balance).toFixed(4)} ETH`;
    },
    
    formatTimestamp(timestamp) {
        return new Date(timestamp * 1000).toLocaleString('zh-CN');
    },
    
    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (elements.statusMessage) {
            elements.statusMessage.textContent = message;
            elements.statusMessage.className = `status-message ${type}`;
        }
        
        // 简化版通知
        if (type === 'error') {
            alert(`❌ ${message}`);
        } else if (type === 'success') {
            alert(`✅ ${message}`);
        } else {
            alert(`ℹ️ ${message}`);
        }
    },
    
    updateTransactionStatus(message, txHash = null) {
        if (elements.transactionStatus) {
            let content = message;
            if (txHash) {
                content += ` <a href="${CONTRACT_CONFIG.NETWORK.blockExplorer}/tx/${txHash}" target="_blank">查看交易</a>`;
            }
            elements.transactionStatus.innerHTML = content;
        }
    }
};

// 网络检查
async function checkNetwork() {
    const network = await web3.getNetwork();
    if (network.chainId !== CONTRACT_CONFIG.NETWORK.chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${CONTRACT_CONFIG.NETWORK.chainId.toString(16)}` }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${CONTRACT_CONFIG.NETWORK.chainId.toString(16)}`,
                            chainName: CONTRACT_CONFIG.NETWORK.name,
                            rpcUrls: [CONTRACT_CONFIG.NETWORK.rpcUrl],
                            blockExplorerUrls: [CONTRACT_CONFIG.NETWORK.blockExplorer]
                        }],
                    });
                } catch (addError) {
                    throw new Error('无法添加网络');
                }
            } else {
                throw new Error('请切换到Sepolia测试网络');
            }
        }
    }
}

// 钱包连接
async function connectWallet() {
    try {
        utils.showLoading("正在连接钱包...");
        
        if (typeof window.ethereum === 'undefined') {
            throw new Error('请安装 MetaMask');
        }
        
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        if (accounts.length === 0) {
            throw new Error('未找到账户');
        }
        
        userAccount = accounts[0];
        web3 = new ethers.BrowserProvider(window.ethereum);
        signer = await web3.getSigner();
        
        // 检查网络
        await checkNetwork();
        
        // 初始化合约
        contract = new ethers.Contract(
            CONTRACT_CONFIG.ADDRESS,
            CONTRACT_CONFIG.ABI,
            signer
        );
        
        const network = await web3.getNetwork();
        const balance = await web3.getBalance(userAccount);
        
        // 检查是否为管理员
        const adminAddress = await contract.admin();
        isAdmin = adminAddress.toLowerCase() === userAccount.toLowerCase();
        
        updateWalletUI(network, balance);
        updateUIVisibility();
        
        // 加载投票会话
        await loadVotingSessions();
        
        utils.hideLoading();
        utils.showNotification("钱包连接成功！", "success");
        
    } catch (error) {
        utils.hideLoading();
        console.error("连接失败:", error);
        utils.showNotification(`连接失败: ${error.message}`, "error");
    }
}

// 更新钱包UI
function updateWalletUI(network, balance) {
    if (elements.accountAddress) {
        elements.accountAddress.textContent = utils.formatAddress(userAccount);
    }
    if (elements.networkName) {
        elements.networkName.textContent = network.name || "未知网络";
    }
    if (elements.accountBalance) {
        elements.accountBalance.textContent = utils.formatBalance(ethers.formatEther(balance));
    }
    if (elements.connectWallet) {
        elements.connectWallet.textContent = "已连接";
        elements.connectWallet.disabled = true;
    }
}

// 更新UI可见性
function updateUIVisibility() {
    if (elements.adminPanel) {
        elements.adminPanel.style.display = 'block'; // 允许所有人创建投票会话
    }
}

// 加载投票会话
async function loadVotingSessions() {
    try {
        const totalSessions = await contract.getTotalSessions();
        votingSessions = [];
        
        for (let i = 0; i < totalSessions; i++) {
            const session = await contract.getVotingSession(i);
            const sessionData = {
                id: i,
                title: session[0],
                description: session[1],
                startTime: Number(session[2]),
                endTime: Number(session[3]),
                totalVoters: Number(session[4]),
                isActive: session[5],
                optionCount: Number(session[6])
            };
            
            // 获取选项名称
            sessionData.options = [];
            for (let j = 0; j < sessionData.optionCount; j++) {
                const optionName = await contract.getOptionName(i, j);
                sessionData.options.push(optionName);
            }
            
            // 检查用户是否已投票
            sessionData.hasVoted = await contract.hasVoted(i, userAccount);
            
            votingSessions.push(sessionData);
        }
        
        renderVotingSessions();
    } catch (error) {
        console.error("加载投票会话失败:", error);
        utils.showNotification("加载投票会话失败", "error");
    }
}

// 渲染投票会话列表
function renderVotingSessions() {
    if (!elements.sessionsList) return;
    
    if (votingSessions.length === 0) {
        elements.sessionsList.innerHTML = '<p class="no-sessions">暂无投票会话</p>';
        return;
    }
    
    const sessionsHTML = votingSessions.map(session => {
        const now = Math.floor(Date.now() / 1000);
        const status = !session.isActive ? '已结束' : 
                      now < session.startTime ? '未开始' : 
                      now > session.endTime ? '已过期' : '进行中';
        
        const statusClass = status === '进行中' ? 'active' : 
                           status === '已结束' ? 'ended' : 'pending';
        
        return `
            <div class="session-card" data-session-id="${session.id}">
                <div class="session-header">
                    <h3>${session.title}</h3>
                    <span class="session-status ${statusClass}">${status}</span>
                </div>
                <div class="session-details">
                    <p><strong>描述:</strong> ${session.description}</p>
                    <p><strong>开始时间:</strong> ${utils.formatTimestamp(session.startTime)}</p>
                    <p><strong>结束时间:</strong> ${utils.formatTimestamp(session.endTime)}</p>
                    <p><strong>总投票数:</strong> ${session.totalVoters}</p>
                    <p><strong>选项数量:</strong> ${session.optionCount}</p>
                    ${session.hasVoted ? '<p class="voted-indicator">✅ 您已投票</p>' : ''}
                </div>
                <div class="session-actions">
                    ${status === '进行中' && !session.hasVoted ? 
                        `<button class="btn btn-primary" onclick="selectSession(${session.id})">参与投票</button>` : 
                        ''}
                    ${isAdmin && session.isActive ? 
                        `<button class="btn btn-danger" onclick="endSession(${session.id})">结束投票</button>` : 
                        ''}
                </div>
            </div>
        `;
    }).join('');
    
    elements.sessionsList.innerHTML = sessionsHTML;
}

// 选择投票会话
function selectSession(sessionId) {
    selectedSessionId = sessionId;
    const session = votingSessions[sessionId];
    
    if (!session) return;
    
    // 显示当前会话信息
    if (elements.currentSession) {
        elements.currentSession.innerHTML = `
            <h3>${session.title}</h3>
            <p>${session.description}</p>
            <p><strong>结束时间:</strong> ${utils.formatTimestamp(session.endTime)}</p>
        `;
    }
    
    // 显示投票选项
    if (elements.voteOptions) {
        const optionsHTML = session.options.map((option, index) => `
            <label class="vote-option">
                <input type="radio" name="voteChoice" value="${index}">
                <span>${option}</span>
            </label>
        `).join('');
        
        elements.voteOptions.innerHTML = optionsHTML;
    }
    
    // 滚动到投票区域
    document.getElementById('votingSection').scrollIntoView({ behavior: 'smooth' });
}

// 创建投票会话
async function createVotingSession() {
    try {
        const title = document.getElementById('sessionTitle').value.trim();
        const description = document.getElementById('sessionDescription').value.trim();
        const duration = parseInt(document.getElementById('sessionDuration').value);
        const optionsText = document.getElementById('sessionOptions').value.trim();
        
        if (!title || !description || !duration || !optionsText) {
            throw new Error("请填写所有必填字段");
        }
        
        const options = optionsText.split('\n').map(opt => opt.trim()).filter(opt => opt);
        if (options.length < 2) {
            throw new Error("至少需要2个投票选项");
        }
        
        utils.showLoading("正在创建投票会话...");
        
        const durationInSeconds = duration * 3600; // 转换为秒
        const tx = await contract.createVotingSession(title, description, durationInSeconds, options);
        
        utils.updateTransactionStatus("交易已提交，等待确认...", tx.hash);
        
        const receipt = await tx.wait();
        
        utils.hideLoading();
        utils.showNotification("投票会话创建成功！", "success");
        utils.updateTransactionStatus("交易已确认", tx.hash);
        
        // 清空表单
        document.getElementById('sessionTitle').value = '';
        document.getElementById('sessionDescription').value = '';
        document.getElementById('sessionDuration').value = '24';
        document.getElementById('sessionOptions').value = '';
        
        // 重新加载会话列表
        await loadVotingSessions();
        
    } catch (error) {
        utils.hideLoading();
        console.error("创建投票会话失败:", error);
        utils.showNotification(`创建失败: ${error.message}`, "error");
    }
}

// 提交投票
async function submitVote() {
    if (selectedSessionId === null) {
        utils.showNotification("请先选择一个投票会话", "error");
        return;
    }
    
    try {
        const selectedOption = document.querySelector('input[name="voteChoice"]:checked');
        if (!selectedOption) {
            throw new Error("请选择一个投票选项");
        }
        
        const voteChoice = parseInt(selectedOption.value);
        
        utils.showLoading("正在提交投票...");
        
        const tx = await contract.vote(selectedSessionId, voteChoice);
        
        utils.updateTransactionStatus("投票交易已提交，等待确认...", tx.hash);
        
        const receipt = await tx.wait();
        
        utils.hideLoading();
        utils.showNotification("投票提交成功！", "success");
        utils.updateTransactionStatus("投票已确认", tx.hash);
        
        // 重新加载会话列表
        await loadVotingSessions();
        
        // 清空选择
        selectedSessionId = null;
        if (elements.currentSession) elements.currentSession.innerHTML = '';
        if (elements.voteOptions) elements.voteOptions.innerHTML = '';
        
    } catch (error) {
        utils.hideLoading();
        console.error("投票失败:", error);
        utils.showNotification(`投票失败: ${error.message}`, "error");
    }
}

// 结束投票会话
async function endSession(sessionId) {
    if (!isAdmin) {
        utils.showNotification("只有管理员可以结束投票会话", "error");
        return;
    }
    
    if (!confirm("确定要结束这个投票会话吗？")) {
        return;
    }
    
    try {
        utils.showLoading("正在结束投票会话...");
        
        const tx = await contract.endVotingSession(sessionId);
        
        utils.updateTransactionStatus("交易已提交，等待确认...", tx.hash);
        
        const receipt = await tx.wait();
        
        utils.hideLoading();
        utils.showNotification("投票会话已结束！", "success");
        utils.updateTransactionStatus("交易已确认", tx.hash);
        
        // 重新加载会话列表
        await loadVotingSessions();
        
    } catch (error) {
        utils.hideLoading();
        console.error("结束投票会话失败:", error);
        utils.showNotification(`结束失败: ${error.message}`, "error");
    }
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 FHEVM 机密投票系统初始化...');
    console.log('📍 合约地址:', CONTRACT_CONFIG.ADDRESS);
    console.log('🌐 目标网络:', CONTRACT_CONFIG.NETWORK.name);
    
    // 钱包连接按钮
    if (elements.connectWallet) {
        elements.connectWallet.addEventListener('click', connectWallet);
    }
    
    // 创建投票会话按钮
    const createSessionBtn = document.getElementById('createSession');
    if (createSessionBtn) {
        createSessionBtn.addEventListener('click', createVotingSession);
    }
    
    // 提交投票按钮
    const submitVoteBtn = document.getElementById('submitVote');
    if (submitVoteBtn) {
        submitVoteBtn.addEventListener('click', submitVote);
    }
    
    // 刷新会话列表按钮
    const refreshSessionsBtn = document.getElementById('refreshSessions');
    if (refreshSessionsBtn) {
        refreshSessionsBtn.addEventListener('click', loadVotingSessions);
    }
    
    // 监听账户变化
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                location.reload();
            } else if (accounts[0] !== userAccount) {
                location.reload();
            }
        });
        
        window.ethereum.on('chainChanged', () => {
            location.reload();
        });
    }
    
    console.log('✅ 系统初始化完成');
});

// 全局函数，供HTML调用
window.selectSession = selectSession;
window.endSession = endSession; 