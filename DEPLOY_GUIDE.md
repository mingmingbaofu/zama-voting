# 🚀 机密投票合约部署指南

## 📋 前置条件

作为一个Web3开发新手，您需要：

1. **Node.js** (已安装)
2. **MetaMask钱包** 或其他以太坊钱包
3. **测试网ETH** (用于支付gas费用)
4. **Infura账户** (免费)

## 🔧 环境设置

### 1. 获取私钥

**⚠️ 重要：仅在测试网络使用，永远不要在主网使用真实资金的私钥！**

从MetaMask获取私钥：
1. 打开MetaMask
2. 点击账户菜单 → 账户详情
3. 点击"导出私钥"
4. 输入密码并复制私钥

### 2. 获取Infura API密钥

1. 访问 https://infura.io
2. 注册免费账户
3. 创建新项目
4. 复制项目ID作为API密钥

### 3. 配置环境变量

编辑 `.env` 文件：
```bash
# 替换为您的实际私钥
PRIVATE_KEY=0x你的私钥

# 替换为您的Infura API密钥
INFURA_API_KEY=你的infura_api_key

# 可选：Etherscan API密钥（用于合约验证）
ETHERSCAN_API_KEY=你的etherscan_api_key
```

## 🌐 部署网络选择

### 推荐新手使用的网络：

#### 1. **Zama测试网** (推荐 - 专门用于FHEVM)
```bash
npm run deploy:zama
```

#### 2. **Sepolia测试网** (以太坊官方测试网)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### 3. **本地开发网络**
```bash
# 启动本地节点
npm run node

# 在新终端中部署
npm run deploy
```

## 📝 部署步骤

### 方法1：使用Zama测试网 (推荐)

1. **获取测试ETH**
   - 访问 Zama测试网水龙头
   - 请求测试ETH到您的地址

2. **编译合约**
   ```bash
   npm run compile
   ```

3. **部署合约**
   ```bash
   npm run deploy:zama
   ```

### 方法2：使用Sepolia测试网

1. **获取测试ETH**
   - 访问 https://sepoliafaucet.com
   - 请求测试ETH到您的地址

2. **编译合约**
   ```bash
   npm run compile
   ```

3. **部署合约**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

## 📊 部署输出解读

成功部署后，您会看到类似输出：

```
🚀 开始部署机密投票合约...
📝 部署者地址: 0x1234...
💰 账户余额: 0.1 ETH
🌐 当前网络: zama (Chain ID: 8009)
📦 编译和部署合约...
✅ 合约已部署到地址: 0xABCD...
```

**重要：保存合约地址！** 这是您的合约在区块链上的唯一标识。

## 🛠️ 常见问题解决

### 1. 账户余额不足
```
Error: insufficient funds for gas * price + value
```
**解决方案：** 从测试网水龙头获取更多测试ETH

### 2. 私钥格式错误
```
Error: invalid private key
```
**解决方案：** 确保私钥以 `0x` 开头

### 3. 网络连接问题
```
Error: network request failed
```
**解决方案：** 检查网络连接，确认Infura API密钥正确

### 4. 合约编译失败
```
Error: Solidity compilation failed
```
**解决方案：** 运行 `npm run clean` 然后重新编译

## 🎯 部署后验证

1. **检查合约地址**
   - 访问区块链浏览器
   - 搜索您的合约地址

2. **测试合约功能**
   ```bash
   npm run test
   ```

3. **启动前端界面**
   ```bash
   # 使用 http-server 在项目根目录启动
   npx http-server . -o
   
   # 或者使用 npm script
   npm run frontend
   ```

## 🏆 提交给Zama Builder

部署成功后，您需要：

1. **记录以下信息：**
   - 合约地址
   - 部署网络
   - 部署交易哈希
   - GitHub仓库链接

2. **提交格式：**
   ```
   项目名称: 机密投票系统
   合约地址: 0x你的合约地址
   网络: Zama测试网
   GitHub: https://github.com/你的用户名/项目名
   ```

## 🚨 安全提醒

1. **永远不要在主网使用测试私钥**
2. **不要在代码中硬编码私钥**
3. **定期备份您的私钥**
4. **使用不同的私钥用于不同的网络**

---

**需要帮助？** 查看Hardhat文档或联系技术支持！ 