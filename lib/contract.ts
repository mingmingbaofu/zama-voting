import { ethers } from 'ethers'

// Declare window type for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}

// Contract ABI (simplified for demo)
const CONTRACT_ABI: any[] = [
  {
    "inputs": [],
    "name": "HandlesAlreadySavedForRequestID",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidKMSSignatures",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoHandleFoundForRequestID",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnsupportedHandleType",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "requestID",
        "type": "uint256"
      }
    ],
    "name": "DecryptionFulfilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "PollCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      }
    ],
    "name": "PollEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "requestId",
        "type": "uint256"
      }
    ],
    "name": "ResultsRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "requestId",
        "type": "uint256"
      },
      {
        "internalType": "bytes[]",
        "name": "signatures",
        "type": "bytes[]"
      }
    ],
    "name": "callbackResults",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "options",
        "type": "string[]"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "createPoll",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      }
    ],
    "name": "endPoll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      }
    ],
    "name": "getPollInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "options",
        "type": "string[]"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pollCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "polls",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      }
    ],
    "name": "requestResults",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "optionId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedVote",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

interface Poll {
  id: number
  title: string
  description: string
  options: string[]
  endTime: number
  isActive: boolean
  creator: string
  totalVotes: number
}

class ContractService {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private contractAddress: string | null = null

  async initialize(contractAddress: string) {
    try {
      if (typeof window === 'undefined' || !window?.ethereum) {
        throw new Error('MetaMask not found')
      }

      this.contractAddress = contractAddress
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer)

      console.log('Contract service initialized')
      return true
    } catch (error) {
      console.error('Failed to initialize contract service:', error)
      return false
    }
  }

  async createPoll(title: string, description: string, options: string[], durationHours: number): Promise<number | null> {
    if (!this.contract) {
      console.error('Contract not initialized')
      return null
    }

    try {
      const durationSeconds = durationHours * 60 * 60
      const tx = await this.contract.createPoll(title, description, options, durationSeconds)
      const receipt = await tx.wait()
      
      // Extract poll ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log)
          return parsed?.name === 'PollCreated'
        } catch {
          return false
        }
      })
      
      if (event) {
        const parsed = this.contract.interface.parseLog(event)
        return Number(parsed?.args.pollId)
      }
      
      return null
    } catch (error) {
      console.error('Failed to create poll:', error)
      throw error
    }
  }

  async vote(pollId: number, optionId: number): Promise<boolean> {
    if (!this.contract || !this.contractAddress) {
      console.error('Contract not initialized')
      return false
    }

    try {
      if (!(window as any).zamaInstance) {
        await (window as any).initZamaFHE()
      }
      const instance = (window as any).zamaInstance

      // Initialize FHE if not already done
      const userAddress = await this.signer!.getAddress()

      // Encrypt the vote (1 for selected option)
      const encryptedVote = await instance.createEncryptedInput(this.contractAddress,
        userAddress,
      )
        .add32(1)
        .encrypt();
      if (!encryptedVote) {
        throw new Error('Failed to encrypt vote')
      }

      // For now, use the encrypted data and proof directly since we're using mock implementation
      const tx = await this.contract.vote(pollId, optionId, encryptedVote.handles[0], encryptedVote.inputProof)
      await tx.wait()
      
      console.log('Vote submitted successfully')
      return true
    } catch (error) {
      console.error('Failed to submit vote:', error)
      throw error
    }
  }

  async getPoll(pollId: number): Promise<Poll | null> {
    if (!this.contract) {
      console.error('Contract not initialized')
      return null
    }

    try {
      const result = await this.contract.getPollInfo(pollId)
      return {
        id: pollId,
        title: result.title,
        description: result.description,
        options: result.options,
        endTime: Number(result.endTime) * 1000, // Convert to milliseconds
        isActive: result.isActive,
        creator: result.creator,
        totalVotes: 0 // This would need to be calculated separately
      }
    } catch (error) {
      console.error('Failed to get poll:', error)
      return null
    }
  }

  async getAllPolls(): Promise<Poll[]> {
    if (!this.contract) {
      console.error('Contract not initialized')
      return []
    }

    try {
      const pollCount = await this.contract.pollCount()
      const polls: Poll[] = []
      
      for (let i = 0; i < Number(pollCount); i++) {
        const poll = await this.getPoll(i)
        if (poll) {
          polls.push(poll)
        }
      }
      
      return polls.reverse() // Show newest first
    } catch (error) {
      console.error('Failed to get all polls:', error)
      return []
    }
  }

  async hasUserVoted(pollId: number, userAddress: string): Promise<boolean> {
    if (!this.contract) {
      console.error('Contract not initialized')
      return false
    }

    try {
      const result = await this.contract.hasUserVoted(pollId, userAddress)
      // This returns encrypted data, so we can't directly check it
      // In a real implementation, you'd need to handle this differently
      return false
    } catch (error) {
      console.error('Failed to check if user voted:', error)
      return false
    }
  }

  async requestResults(pollId: number): Promise<number | null> {
    if (!this.contract) {
      console.error('Contract not initialized')
      return null
    }

    try {
      const tx = await this.contract.requestResults(pollId)
      const receipt = await tx.wait()
      
      // Extract request ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log)
          return parsed?.name === 'ResultsRequested'
        } catch {
          return false
        }
      })
      
      if (event) {
        const parsed = this.contract.interface.parseLog(event)
        return Number(parsed?.args.requestId)
      }
      
      return null
    } catch (error) {
      console.error('Failed to request results:', error)
      throw error
    }
  }

  getContractAddress(): string | null {
    return this.contractAddress
  }

  isInitialized(): boolean {
    return this.contract !== null
  }
}

// Export singleton instance
export const contractService = new ContractService()

// Utility functions
export const initializeContract = async (contractAddress: string) => {
  return await contractService.initialize(contractAddress)
}

export const createPoll = async (title: string, description: string, options: string[], duration: number) => {
  return await contractService.createPoll(title, description, options, duration)
}

export const submitVote = async (pollId: number, optionId: number) => {
  return await contractService.vote(pollId, optionId)
}

export const getPoll = async (pollId: number) => {
  return await contractService.getPoll(pollId)
}

export const getAllPolls = async () => {
  return await contractService.getAllPolls()
}

export const checkUserVoted = async (pollId: number, userAddress: string) => {
  return await contractService.hasUserVoted(pollId, userAddress)
}

export const requestPollResults = async (pollId: number) => {
  return await contractService.requestResults(pollId)
}