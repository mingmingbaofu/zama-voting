#!/bin/bash

echo "🚀 机密投票合约快速部署脚本"
echo "================================="

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "❌ 未找到.env文件，正在创建..."
    cp env.example .env
    echo "✅ 已创建.env文件，请编辑并填入您的私钥和API密钥"
    echo ""
    echo "需要配置的项目："
    echo "1. PRIVATE_KEY=0x你的私钥"
    echo "2. INFURA_API_KEY=你的infura_api_key"
    echo ""
    echo "配置完成后，请重新运行此脚本"
    exit 1
fi

# 检查私钥是否已配置
if grep -q "your_private_key_here" .env; then
    echo "⚠️ 请先在.env文件中配置您的私钥和API密钥"
    echo "需要配置的项目："
    echo "1. PRIVATE_KEY=0x你的私钥"
    echo "2. INFURA_API_KEY=你的infura_api_key"
    exit 1
fi

echo "🔧 检查环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo "🔨 编译合约..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ 合约编译失败"
    exit 1
fi

echo ""
echo "🌐 选择部署网络："
echo "1. Zama测试网 (推荐 - 专门用于FHEVM)"
echo "2. Sepolia测试网 (以太坊官方测试网)"
echo "3. 本地开发网络"

read -p "请选择网络 (1-3): " network_choice

case $network_choice in
    1)
        echo "🚀 部署到Zama测试网..."
        npm run deploy:zama
        ;;
    2)
        echo "🚀 部署到Sepolia测试网..."
        npx hardhat run scripts/deploy.js --network sepolia
        ;;
    3)
        echo "🚀 部署到本地开发网络..."
        npm run deploy
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署完成！"
    echo "请保存合约地址用于后续使用"
    echo ""
    echo "下一步："
    echo "1. 测试合约功能: npm run test"
    echo "2. 启动前端界面: npm run frontend"
else
    echo "❌ 部署失败，请检查错误信息"
    echo ""
    echo "常见问题："
    echo "1. 账户余额不足 - 从测试网水龙头获取ETH"
    echo "2. 私钥格式错误 - 确保私钥以0x开头"
    echo "3. 网络连接问题 - 检查Infura API密钥"
fi 