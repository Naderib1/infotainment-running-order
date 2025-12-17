import { useState, useMemo } from 'react'
import { games, stageLabels, Game } from '@/data/games'
import { Trophy, ChevronDown, Calendar, MapPin, Clock, Users, Sparkles } from 'lucide-react'

interface CompactGameScheduleProps {
  onSelectGame: (game: Game) => void
}

// Stage colors with gradients
const stageColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  GROUP_STAGE: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30', gradient: 'from-blue-500 to-indigo-500' },
  ROUND_OF_16: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500' },
  QUARTER_FINAL: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30', gradient: 'from-orange-500 to-red-500' },
  SEMI_FINAL: { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500/30', gradient: 'from-pink-500 to-rose-500' },
  THIRD_PLACE: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30', gradient: 'from-amber-500 to-yellow-500' },
  FINAL: { bg: 'bg-yellow-500/10', text: 'text-yellow-700', border: 'border-yellow-500/30', gradient: 'from-yellow-500 to-amber-500' },
}

export function CompactGameSchedule({ onSelectGame }: CompactGameScheduleProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  // Group games by date
  const gamesByDate = useMemo(() => {
    return games.reduce((acc, game) => {
      if (!acc[game.date]) {
        acc[game.date] = []
      }
      acc[game.date].push(game)
      return acc
    }, {} as Record<string, Game[]>)
  }, [])

  // Get unique stages
  const stages = useMemo(() => {
    const uniqueStages = [...new Set(games.map(g => g.stage))]
    return uniqueStages
  }, [])

  // Filter dates based on selected stage
  const filteredDates = useMemo(() => {
    if (!selectedStage) return Object.keys(gamesByDate)
    return Object.keys(gamesByDate).filter(date => 
      gamesByDate[date].some(game => game.stage === selectedStage)
    )
  }, [gamesByDate, selectedStage])

  // Get filtered games for a date
  const getFilteredGames = (date: string) => {
    if (!selectedStage) return gamesByDate[date]
    return gamesByDate[date].filter(game => game.stage === selectedStage)
  }

  // Stats
  const totalMatches = games.length
  const totalDays = Object.keys(gamesByDate).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8 pt-10">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-3 shadow-2xl">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-white tracking-tight">
                AFCON 2025
              </h1>
              <p className="text-emerald-300 text-sm font-medium">
                Morocco • Dec 21 - Jan 18
              </p>
            </div>
          </div>
          
          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{totalDays} Match Days</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{totalMatches} Matches</span>
            </div>
          </div>
        </div>

        {/* Stage Filter Pills */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedStage(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedStage
                  ? 'bg-white text-emerald-900 shadow-lg shadow-white/20'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
              }`}
            >
              All Stages
            </button>
            {stages.map(stage => {
              const colors = stageColors[stage] || stageColors.GROUP_STAGE
              return (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(selectedStage === stage ? null : stage)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedStage === stage
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                      : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {stageLabels[stage]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-3">
          {filteredDates.map((date, dateIndex) => {
            const dateGames = getFilteredGames(date)
            const isExpanded = expandedDate === date
            
            // Parse date for better display
            const dayName = date.split(' ')[0]
            const dayNum = date.match(/\d+/)?.[0]
            const month = date.split(' ').slice(-1)[0]
            
            return (
              <div 
                key={date} 
                className={`
                  backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300
                  ${isExpanded 
                    ? 'bg-white/15 shadow-2xl shadow-black/20 ring-1 ring-white/20' 
                    : 'bg-white/10 hover:bg-white/12 ring-1 ring-white/10'
                  }
                `}
                style={{ animationDelay: `${dateIndex * 50}ms` }}
              >
                {/* Date Header */}
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : date)}
                  className="w-full flex items-center gap-4 px-5 py-4 transition-colors"
                >
                  {/* Date Badge */}
                  <div className={`
                    flex flex-col items-center justify-center w-14 h-14 rounded-xl
                    ${isExpanded 
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg' 
                      : 'bg-white/10 text-white'
                    }
                  `}>
                    <span className="text-xs font-medium uppercase opacity-80">{month.slice(0, 3)}</span>
                    <span className="text-xl font-bold leading-none">{dayNum}</span>
                  </div>
                  
                  {/* Date Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold text-lg">
                      {dayName}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-emerald-300/80 text-sm">
                        {dateGames.length} {dateGames.length === 1 ? 'match' : 'matches'}
                      </span>
                      {/* Show stages for this day */}
                      <div className="flex gap-1">
                        {[...new Set(dateGames.map(g => g.stage))].map(stage => {
                          const colors = stageColors[stage] || stageColors.GROUP_STAGE
                          return (
                            <span 
                              key={stage}
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expand Icon */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${isExpanded ? 'bg-white/20 rotate-180' : 'bg-white/10'}
                  `}>
                    <ChevronDown className="h-5 w-5 text-white" />
                  </div>
                </button>

                {/* Games List */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {dateGames.map((game, gameIndex) => {
                      const colors = stageColors[game.stage] || stageColors.GROUP_STAGE
                      
                      return (
                        <button
                          key={game.id}
                          onClick={() => onSelectGame(game)}
                          className={`
                            w-full group relative overflow-hidden rounded-xl p-4
                            bg-white/5 hover:bg-white/10 
                            border border-white/10 hover:border-white/20
                            transition-all duration-200 hover:scale-[1.01] hover:shadow-lg
                          `}
                          style={{ animationDelay: `${gameIndex * 100}ms` }}
                        >
                          {/* Gradient accent */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colors.gradient}`} />
                          
                          <div className="flex items-center gap-4 pl-3">
                            {/* Time */}
                            <div className="flex flex-col items-center min-w-[50px]">
                              <Clock className="h-3.5 w-3.5 text-white/40 mb-1" />
                              <span className="text-white font-bold text-sm">{game.time}</span>
                            </div>
                            
                            {/* Divider */}
                            <div className="w-px h-10 bg-white/10" />
                            
                            {/* Teams */}
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">
                                  {game.teamA}
                                </span>
                                <span className="text-white/40 text-sm">vs</span>
                                <span className="text-white font-semibold">
                                  {game.teamB}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-3 w-3 text-white/40" />
                                <span className="text-white/60 text-xs">{game.city} • {game.stadium}</span>
                              </div>
                            </div>
                            
                            {/* Stage Badge */}
                            <div className={`
                              px-3 py-1.5 rounded-lg text-xs font-semibold
                              bg-gradient-to-r ${colors.gradient} text-white
                              shadow-lg opacity-90 group-hover:opacity-100
                            `}>
                              {stageLabels[game.stage]}
                            </div>
                          </div>
                          
                          {/* Hover effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        <div className="text-center mt-8 pb-6">
          <p className="text-white/40 text-sm flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Click on a match to view its Running Order
          </p>
        </div>
      </div>
    </div>
  )
}
