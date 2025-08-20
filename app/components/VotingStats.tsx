'use client'

import { BarChart3, Users, Clock, TrendingUp } from 'lucide-react'

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

interface VotingStatsProps {
  polls: Poll[]
}

export function VotingStats({ polls }: VotingStatsProps) {
  const totalPolls = polls.length
  const activePolls = polls.filter(poll => poll.isActive && poll.endTime > Date.now()).length
  const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0)
  const endedPolls = polls.filter(poll => poll.endTime <= Date.now()).length

  const stats = [
    {
      label: 'Total Polls',
      value: totalPolls,
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Polls',
      value: activePolls,
      icon: Clock,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Votes',
      value: totalVotes,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Completed',
      value: endedPolls,
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 card-hover`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            
            {/* Additional info based on stat type */}
            {stat.label === 'Active Polls' && activePolls > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                {activePolls === 1 ? '1 poll' : `${activePolls} polls`} accepting votes
              </div>
            )}
            
            {stat.label === 'Total Votes' && totalVotes > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                Avg {totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0} votes per poll
              </div>
            )}
            
            {stat.label === 'Completed' && endedPolls > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                Results available for viewing
              </div>
            )}
            
            {stat.label === 'Total Polls' && totalPolls > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                {Math.round((activePolls / totalPolls) * 100)}% currently active
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}