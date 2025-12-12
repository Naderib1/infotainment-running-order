import { useState } from 'react'
import { games, stageLabels, Game } from '@/data/games'
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react'

interface CompactGameScheduleProps {
  onSelectGame: (game: Game) => void
}

export function CompactGameSchedule({ onSelectGame }: CompactGameScheduleProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  // Group games by date
  const gamesByDate = games.reduce((acc, game) => {
    if (!acc[game.date]) {
      acc[game.date] = []
    }
    acc[game.date].push(game)
    return acc
  }, {} as Record<string, Game[]>)

  const dates = Object.keys(gamesByDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-2 shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              AFCON 2025
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Select a match to view the Running Order
          </p>
        </div>

        {/* Compact Schedule */}
        <div className="space-y-2">
          {dates.map(date => {
            const dateGames = gamesByDate[date]
            const isExpanded = expandedDate === date
            
            return (
              <div key={date} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                {/* Date Header - Clickable */}
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : date)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {date}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {dateGames.length} matches
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {/* Games List - Expandable */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700">
                    {dateGames.map(game => (
                      <button
                        key={game.id}
                        onClick={() => onSelectGame(game)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition border-b border-slate-50 dark:border-slate-700 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-12">{game.time}</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {game.teamA} vs {game.teamB}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{game.city}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            game.stage === 'GROUP_STAGE' ? 'bg-blue-100 text-blue-600' :
                            game.stage === 'ROUND_OF_16' ? 'bg-purple-100 text-purple-600' :
                            game.stage === 'QUARTER_FINAL' ? 'bg-orange-100 text-orange-600' :
                            game.stage === 'SEMI_FINAL' ? 'bg-pink-100 text-pink-600' :
                            game.stage === 'FINAL' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {stageLabels[game.stage]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
