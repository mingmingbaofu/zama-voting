'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { PollList } from './components/PollList'
import { CreatePollModal } from './components/CreatePollModal'
import { VotingStats } from './components/VotingStats'
// Enable contract imports to get data from blockchain
import { contractService, initializeContract, getAllPolls } from '@/lib/contract'
import { Plus, Vote, Shield, Lock } from 'lucide-react'

export default function HomePage() {
  const { isConnected } = useAccount()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load polls from contract
    loadPolls()
  }, [isConnected])

  const loadPolls = async () => {
    setLoading(true)
    try {
      console.log('Loading polls...', { isConnected })
      
      if (isConnected) {
        // Get contract address from environment variable
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xaDe53C112C18942BA346aE971F91Afdb8a45FE87'
        
        if (!contractAddress) {
          console.error('Contract address not found')
          setPolls([])
          return
        }

        // Initialize contract if not already initialized
        if (!contractService.isInitialized()) {
          const initialized = await initializeContract(contractAddress)
          if (!initialized) {
            console.error('Failed to initialize contract')
            setPolls([])
            return
          }
        }

        // Get polls from blockchain
        const blockchainPolls = await getAllPolls()
        console.log('Blockchain polls loaded:', blockchainPolls)
        setPolls(blockchainPolls)
      } else {
        // Show empty state when not connected
        console.log('Wallet not connected, showing empty state')
        setPolls([])
      }
    } catch (error) {
      console.error('Error loading polls:', error)
      // Fallback to empty array on error
      setPolls([])
    } finally {
      setLoading(false)
    }
  }

  const handlePollCreated = (newPoll: any) => {
    setPolls(prev => [newPoll, ...prev])
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-100 rounded-full">
            <Shield className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Privacy-First Voting Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Vote with complete privacy using Zama's Fully Homomorphic Encryption. 
          Your choices remain encrypted throughout the entire voting process.
        </p>
        
        {!isConnected ? (
          <div className="space-y-4">
            <ConnectButton />
            <p className="text-sm text-gray-500">
              Connect your wallet to start voting or create polls
            </p>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Poll</span>
            </button>
            <ConnectButton />
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm card-hover">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fully Encrypted</h3>
          <p className="text-gray-600">
            All votes are encrypted using FHE technology, ensuring complete privacy
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-xl shadow-sm card-hover">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Vote className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Results</h3>
          <p className="text-gray-600">
            Results are computed on encrypted data without revealing individual votes
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-xl shadow-sm card-hover">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Decentralized</h3>
          <p className="text-gray-600">
            Built on blockchain technology for trustless and censorship-resistant voting
          </p>
        </div>
      </div>

      {isConnected && (
        <>
          {/* Voting Stats */}
          <VotingStats polls={polls} />
          
          {/* Polls Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Polls</h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Poll</span>
              </button>
            </div>
            
            <PollList polls={polls} loading={loading} onVote={loadPolls} />
          </div>
        </>
      )}

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPollCreated={handlePollCreated}
      />
    </div>
  )
}