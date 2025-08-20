# FHEVM Voting DApp

A decentralized voting application built with Fully Homomorphic Encryption (FHE) using the FHEVM protocol by Zama. This application enables private and secure voting where vote counts remain encrypted on-chain until results are revealed.

## 🚀 Quick Deploy

### One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fzama-voting&env=NEXT_PUBLIC_CONTRACT_ADDRESS,NEXT_PUBLIC_CHAIN_ID&envDescription=Contract%20address%20and%20chain%20ID%20for%20the%20deployed%20FHE%20voting%20contract&project-name=zama-voting&repository-name=zama-voting)

**Environment Variables Required:**
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: The deployed FHEVoting contract address
- `NEXT_PUBLIC_CHAIN_ID`: The chain ID (e.g., 11155111 for Sepolia)

## Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   For Hardhat (smart contract deployment):
   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

   For Next.js frontend:
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your contract address and chain ID
   # NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   # NEXT_PUBLIC_CHAIN_ID=11155111
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

6. **Start the frontend**

   ```bash
   # Start the Next.js development server
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🌐 Deploy to Production

### Option 1: Deploy to Vercel (Recommended)

1. **Fork this repository** to your GitHub account

2. **Deploy the smart contract** to Sepolia testnet:
   ```bash
   npx hardhat deploy --network sepolia
   ```

3. **Click the Deploy button** above or visit [Vercel](https://vercel.com/new)

4. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed contract address
   - `NEXT_PUBLIC_CHAIN_ID`: `11155111` (for Sepolia)

5. **Deploy** - Vercel will automatically build and deploy your app!

### Option 2: Manual Deployment

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

## ✨ Features

- **Private Voting**: Votes are encrypted using FHE and remain private on-chain
- **Secure Poll Creation**: Anyone can create polls with custom options and duration
- **Real-time Updates**: Live poll status and time remaining display
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets via RainbowKit
- **Modern UI**: Built with Next.js, React, and Tailwind CSS
- **Encrypted Results**: Poll results are only revealed when requested by the poll creator

## 📁 Project Structure

```
zama-voting/
├── app/                 # Next.js frontend application
│   ├── components/      # React components
│   │   ├── CreatePollModal.tsx
│   │   ├── PollList.tsx
│   │   ├── VoteModal.tsx
│   │   └── VotingStats.tsx
│   ├── page.tsx         # Main page
│   └── layout.tsx       # App layout
├── contracts/           # Smart contract source files
│   └── FHEVoting.sol    # FHE voting contract
├── deploy/              # Deployment scripts
├── lib/                 # Utility libraries
│   └── contract.ts      # Contract interaction logic
├── hardhat.config.ts    # Hardhat configuration
└── package.json         # Dependencies and scripts
```

## 📜 Available Scripts

| Script             | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start Next.js development server |
| `npm run build`    | Build the Next.js application |
| `npm run start`    | Start production server       |
| `npm run compile`  | Compile all contracts          |
| `npm run test`     | Run all tests                  |
| `npm run coverage` | Generate coverage report       |
| `npm run lint`     | Run linting checks             |
| `npm run clean`    | Clean build artifacts          |

## 🗳️ How to Use

1. **Connect Wallet**: Click "Connect Wallet" to connect your Web3 wallet
2. **Create Poll**: Click "Create Poll" to create a new voting poll with:
   - Poll title and description
   - Multiple voting options (2-10 options)
   - Poll duration in hours
3. **Vote**: Browse active polls and cast your encrypted vote
4. **View Results**: Poll creators can request decrypted results after the poll ends

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Required
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Your deployed FHEVoting contract address
NEXT_PUBLIC_CHAIN_ID=11155111       # Chain ID (11155111 for Sepolia)

# Optional
NEXT_PUBLIC_INFURA_API_KEY=...      # For better RPC performance
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...  # For enhanced wallet support
```

### Supported Networks

- **Sepolia Testnet** (Chain ID: 11155111) - Recommended for testing
- **Local FHEVM** (Chain ID: 31337) - For local development

## 🔐 Privacy Features

- **Encrypted Votes**: All votes are encrypted using FHE before being stored on-chain
- **Private Tallying**: Vote counts remain encrypted during the voting period
- **Controlled Revelation**: Only poll creators can request result decryption
- **Voter Privacy**: Individual votes cannot be traced back to voters

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ by the Zama team**
