'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { contractService, initializeContract } from '@/lib/contract'

interface CreatePollModalProps {
  isOpen: boolean
  onClose: () => void
  onPollCreated: (poll: any) => void
}

export function CreatePollModal({ isOpen, onClose, onPollCreated }: CreatePollModalProps) {
  const { address } = useAccount()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    duration: 24, // hours
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
    setError(null)
  }

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }))
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, options: newOptions }))
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Poll title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Poll description is required')
      return false
    }
    if (formData.options.length < 2) {
      setError('At least 2 options are required')
      return false
    }
    if (formData.options.some(option => !option.trim())) {
      setError('All options must have text')
      return false
    }
    if (formData.duration < 1) {
      setError('Duration must be at least 1 hour')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

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

      console.log('Creating poll on blockchain:', formData)
      
      // Call smart contract to create poll
      const pollId = await contractService.createPoll(
        formData.title,
        formData.description,
        formData.options.filter(opt => opt.trim()),
        formData.duration
      )
      
      if (pollId === null) {
        throw new Error('Failed to create poll on blockchain')
      }
      
      // Create poll object with blockchain data
      const newPoll = {
        id: pollId,
        title: formData.title,
        description: formData.description,
        options: formData.options.filter(opt => opt.trim()),
        endTime: Date.now() + (formData.duration * 60 * 60 * 1000),
        isActive: true,
        creator: address,
        totalVotes: 0
      }
      
      onPollCreated(newPoll)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        options: ['', ''],
        duration: 24,
      })
    } catch (err: any) {
      console.error('Error creating poll:', err)
      setError(err.message || 'Failed to create poll. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        options: ['', ''],
        duration: 24,
      })
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Poll</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a privacy-preserving poll using FHE encryption
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poll Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                console.log('Title change:', e.target.value);
                handleInputChange('title', e.target.value);
              }}
              placeholder="Enter a clear and concise poll title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
              maxLength={100}
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                console.log('Description change:', e.target.value);
                handleInputChange('description', e.target.value);
              }}
              placeholder="Provide more details about what you're asking"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
              maxLength={500}
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voting Options *
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        console.log('Input change:', e.target.value);
                        handleOptionChange(index, e.target.value);
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      maxLength={100}
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  {formData.options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {formData.options.length < 10 && (
              <button
                onClick={addOption}
                className="mt-3 flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              {formData.options.length}/10 options • Minimum 2 required
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poll Duration *
            </label>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                min="1"
                max="168" // 1 week
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
              />
              <span className="text-gray-600">hours</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Poll will end {formData.duration} hours after creation
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Creating as: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2 min-w-[140px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Poll</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}