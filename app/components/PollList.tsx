'use client'

import { useState } from 'react'
import { Clock, Users, CheckCircle } from 'lucide-react'
import { VoteModal } from './VoteModal'

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

interface PollListProps {
  polls: Poll[]
  loading: boolean
  onVote: () => void
}

export function PollList({ polls, loading, onVote }: PollListProps) {
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)

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

  const handleVoteClick = (poll: Poll) => {
    setSelectedPoll(poll)
    setIsVoteModalOpen(true)
  }

  const handleVoteSubmitted = () => {
    setIsVoteModalOpen(false)
    setSelectedPoll(null)
    onVote() // Refresh polls
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No polls available</h3>
        <p className="text-gray-600 mb-4">Be the first to create a poll and start voting!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {polls.map((poll) => {
          const timeRemaining = formatTimeRemaining(poll.endTime)
          const isEnded = poll.endTime <= Date.now()
          
          return (
            <div
              key={poll.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {poll.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{poll.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className={isEnded ? 'text-red-600' : 'text-green-600'}>
                        {timeRemaining}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{poll.totalVotes} votes</span>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {poll.options.length} options
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {isEnded ? (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Ended</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVoteClick(poll)}
                      className="btn-primary text-sm"
                    >
                      Vote Now
                    </button>
                  )}
                  
                  <div className="text-xs text-gray-400">
                    by {poll.creator.slice(0, 6)}...{poll.creator.slice(-4)}
                  </div>
                </div>
              </div>
              
              {/* Options Preview */}
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600 mb-2">Options:</div>
                <div className="flex flex-wrap gap-2">
                  {poll.options.slice(0, 4).map((option, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {option}
                    </span>
                  ))}
                  {poll.options.length > 4 && (
                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm">
                      +{poll.options.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vote Modal */}
      {selectedPoll && (
        <VoteModal
          isOpen={isVoteModalOpen}
          onClose={() => setIsVoteModalOpen(false)}
          poll={selectedPoll}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}
    </>
  )
}