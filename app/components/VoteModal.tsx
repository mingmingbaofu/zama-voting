'use client'

import { useState } from 'react'
import { X, Lock, AlertCircle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { contractService, initializeContract } from '@/lib/contract'

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

interface VoteModalProps {
  isOpen: boolean
  onClose: () => void
  poll: Poll
  onVoteSubmitted: () => void
}

export function VoteModal({ isOpen, onClose, poll, onVoteSubmitted }: VoteModalProps) {
  const { address } = useAccount()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmitVote = async () => {
    if (selectedOption === null) {
      setError('Please select an option to vote')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Check if wallet is connected
      if (!address) {
        setError('Please connect your wallet first')
        return
      }

      // Initialize contract if not already done
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xaDe53C112C18942BA346aE971F91Afdb8a45FE87'
      if (!contractAddress) {
        setError('Contract address not configured')
        return
      }

      if (!contractService.isInitialized()) {
        await initializeContract(contractAddress)
      }

      console.log('Submitting encrypted vote for option:', selectedOption)
      
      // Submit encrypted vote to blockchain
      const success = await contractService.vote(poll.id, selectedOption)
      
      if (!success) {
        throw new Error('Failed to submit vote to blockchain')
      }
      
      console.log('Vote submitted successfully with FHE encryption')
      onVoteSubmitted()
    } catch (err: any) {
      console.error('Error submitting vote:', err)
      setError(err.message || 'Failed to submit vote. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now()
    const remaining = endTime - now
    
    if (remaining <= 0) return 'Ended'
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cast Your Vote</h2>
            <p className="text-sm text-gray-600 mt-1">
              Your vote will be encrypted and remain private
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poll Info */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
          <p className="text-gray-600 mb-3">{poll.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Poll ID: #{poll.id}</span>
            <span className="text-green-600 font-medium">
              {formatTimeRemaining(poll.endTime)}
            </span>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-6 bg-blue-50 border-b">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Privacy Guaranteed</h4>
              <p className="text-sm text-blue-700">
                Your vote is encrypted using Fully Homomorphic Encryption (FHE) before being submitted. 
                No one, including the poll creator, can see your individual vote choice.
              </p>
            </div>
          </div>
        </div>

        {/* Voting Options */}
        <div className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Select your choice:</h4>
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <label
                key={index}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOption === index
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="vote-option"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-900 font-medium">{option}</span>
                </div>
              </label>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Connected as: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitVote}
              disabled={selectedOption === null || isSubmitting}
              className="btn-primary flex items-center space-x-2 min-w-[120px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Encrypting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Submit Vote</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}