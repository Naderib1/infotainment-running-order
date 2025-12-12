import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { games, stageLabels, Game } from '@/data/games'
import { Trophy, Calendar, MapPin, Clock, ChevronRight, Users, Star, Eye } from 'lucide-react'

interface GameSelectorProps {
  onSelectGame: (game: Game) => void
  isAdmin?: boolean
  gameExtras?: Record<string, { influencers?: string[]; legends?: string[]; playersToWatch?: string[] }>
}

export function GameSelector({ onSelectGame, isAdmin, gameExtras }: GameSelectorProps) {
  const [selectedStage, setSelectedStage] = useState<Game['stage'] | 'ALL'>('ALL')

  const stages: (Game['stage'] | 'ALL')[] = ['ALL', 'GROUP_STAGE', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL']

  const filteredGames = selectedStage === 'ALL' 
    ? games 
    : games.filter(g => g.stage === selectedStage)

  // Group games by date
  const gamesByDate = filteredGames.reduce((acc, game) => {
    if (!acc[game.date]) {
      acc[game.date] = []
    }
    acc[game.date].push(game)
    return acc
  }, {} as Record<string, Game[]>)

  const getStageColor = (stage: Game['stage']) => {
    switch (stage) {
      case 'GROUP_STAGE': return 'from-blue-500 to-blue-600'
      case 'ROUND_OF_16': return 'from-purple-500 to-purple-600'
      case 'QUARTER_FINAL': return 'from-orange-500 to-orange-600'
      case 'SEMI_FINAL': return 'from-pink-500 to-pink-600'
      case 'THIRD_PLACE': return 'from-amber-500 to-amber-600'
      case 'FINAL': return 'from-yellow-500 to-yellow-600'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-3 shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            AFCON 2025 Morocco
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Select a match to view the Infotainment Running Order
          </p>
          {isAdmin && (
            <div className="mt-2 inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-full px-3 py-1">
              <Star className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Admin Mode</span>
            </div>
          )}
        </div>

        {/* Stage Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {stages.map(stage => (
            <Button
              key={stage}
              variant={selectedStage === stage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStage(stage)}
              className={selectedStage === stage ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
            >
              {stage === 'ALL' ? 'All Matches' : stageLabels[stage]}
            </Button>
          ))}
        </div>

        {/* Games List */}
        <div className="space-y-8">
          {Object.entries(gamesByDate).map(([date, dateGames]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{date}</h2>
                <span className="text-sm text-slate-500">({dateGames.length} matches)</span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {dateGames.map(game => {
                  const extras = gameExtras?.[game.id]
                  const hasExtras = extras && (extras.influencers?.length || extras.legends?.length || extras.playersToWatch?.length)
                  
                  return (
                    <Card 
                      key={game.id} 
                      className="group hover:shadow-lg transition-all cursor-pointer border-0 overflow-hidden"
                      onClick={() => onSelectGame(game)}
                    >
                      <div className={`h-1 bg-gradient-to-r ${getStageColor(game.stage)}`} />
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${getStageColor(game.stage)} text-white`}>
                            {stageLabels[game.stage]}
                          </span>
                          <span className="text-xs text-slate-500">Match #{game.matchNumber}</span>
                        </div>
                        <CardTitle className="text-lg mt-2">
                          {game.teamA} <span className="text-slate-400 mx-2">vs</span> {game.teamB}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{game.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{game.stadium}, {game.city}</span>
                          </div>
                          
                          {/* Show extras indicators */}
                          {hasExtras && (
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                              {extras.influencers?.length ? (
                                <div className="flex items-center gap-1 text-xs text-purple-600">
                                  <Users className="h-3 w-3" />
                                  <span>{extras.influencers.length} Influencers</span>
                                </div>
                              ) : null}
                              {extras.legends?.length ? (
                                <div className="flex items-center gap-1 text-xs text-amber-600">
                                  <Star className="h-3 w-3" />
                                  <span>{extras.legends.length} Legends</span>
                                </div>
                              ) : null}
                              {extras.playersToWatch?.length ? (
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <Eye className="h-3 w-3" />
                                  <span>{extras.playersToWatch.length} Players</span>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-end mt-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="group-hover:bg-green-50 group-hover:text-green-600"
                          >
                            View Running Order
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
