const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署机密投票合约...");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log(`📝 部署者地址: ${deployer.address}`);
  
  // 检查账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 账户余额: ${ethers.formatEther(balance)} ETH`);
  
  // 获取当前网络信息
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 当前网络: ${network.name} (Chain ID: ${network.chainId})`);
  
  // 部署合约
  console.log("\n📦 编译和部署合约...");
  const ConfidentialVoting = await ethers.getContractFactory("ConfidentialVoting");
  
  console.log("⏳ 正在部署合约...");
  const votingContract = await ConfidentialVoting.deploy();
  
  console.log("⏳ 等待部署确认...");
  await votingContract.waitForDeployment();
  
  const contractAddress = await votingContract.getAddress();
  console.log(`✅ 合约已部署到地址: ${contractAddress}`);
  
  // 验证部署
  console.log("\n🔍 验证合约部署...");
  const deployedCode = await ethers.provider.getCode(contractAddress);
  if (deployedCode === "0x") {
    console.log("❌ 合约部署失败！");
    process.exit(1);
  } else {
    console.log("✅ 合约部署成功！");
  }
  
  // 获取部署交易信息
  const deployTx = votingContract.deploymentTransaction();
  console.log(`📋 部署交易哈希: ${deployTx.hash}`);
  
  // 打印合约信息
  console.log("\n📄 合约信息:");
  console.log(`   地址: ${contractAddress}`);
  console.log(`   部署者: ${deployer.address}`);
  console.log(`   网络: ${network.name}`);
  console.log(`   链ID: ${network.chainId}`);
  console.log(`   Gas Used: ${deployTx.gasLimit}`);
  
  // 创建一个示例投票会话
  console.log("\n🗳️ 创建示例投票会话...");
  try {
    const createTx = await votingContract.createVotingSession(
      "测试投票",
      "这是一个测试投票会话",
      3600, // 1小时
      ["选项A", "选项B", "选项C"]
    );
    
    await createTx.wait();
    console.log("✅ 示例投票会话创建成功！");
  } catch (error) {
    console.log("⚠️ 创建示例投票会话失败:", error.message);
  }
  
  // 保存部署信息
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx.hash
  };
  
  console.log("\n📋 部署信息已保存:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // 为Builder项目准备提交信息
  console.log("\n🏆 Zama Builder 项目提交信息:");
  console.log("=" * 50);
  console.log(`项目名称: 机密投票系统 (Confidential Voting System)`);
  console.log(`合约地址: ${contractAddress}`);
  console.log(`GitHub仓库: https://github.com/yourusername/zama-confidential-voting`);
  console.log(`功能描述: 基于FHEVM的机密投票系统，支持完全隐私的投票过程`);
  console.log(`技术亮点: 使用FHE加密技术实现投票隐私保护，支持多轮投票和实时结果统计`);
  console.log("=" * 50);
  
  console.log("\n🎉 部署完成！");
  console.log(`📝 请将合约地址 ${contractAddress} 提交给Zama Builder项目！`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 