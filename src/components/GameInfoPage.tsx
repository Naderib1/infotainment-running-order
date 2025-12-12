import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Game } from '@/data/games'
import { GameExtras } from '@/hooks/useGameExtras'
import { Users, Star, Eye, Lightbulb, MapPin, Clock, Calendar, ChevronRight, AlertCircle } from 'lucide-react'

interface GameInfoPageProps {
  game: Game
  extras?: GameExtras
  deactivatedItemNames?: string[]
  onContinue: () => void
}

export function GameInfoPage({ game, extras, deactivatedItemNames, onContinue }: GameInfoPageProps) {
  const hasExtras = extras && (
    extras.influencers?.length > 0 ||
    extras.legends?.length > 0 ||
    extras.players_to_watch?.length > 0 ||
    extras.trivia_moments?.length > 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Match Header */}
        <Card className="mb-6 border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                {game.teamA} vs {game.teamB}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {game.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {game.time}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                {game.stadium}, {game.city}
              </div>
            </div>
          </div>
        </Card>

        {/* Extra Information */}
        {hasExtras && (
          <div className="space-y-4 mb-6">
            {/* Influencers */}
            {extras.influencers?.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-purple-600">
                    <Users className="h-4 w-4" />
                    Influencers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {extras.influencers.map((name, i) => (
                      <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Legends */}
            {extras.legends?.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                    <Star className="h-4 w-4" />
                    Legends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {extras.legends.map((name, i) => (
                      <span key={i} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Players to Watch */}
            {extras.players_to_watch?.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                    <Eye className="h-4 w-4" />
                    Players to Watch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {extras.players_to_watch.map((name, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trivia Moments */}
            {extras.trivia_moments?.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-teal-600">
                    <Lightbulb className="h-4 w-4" />
                    Trivia Moments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {extras.trivia_moments.map((trivia, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-teal-500 mt-1">•</span>
                        {trivia}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Deactivated Items Notice */}
        {deactivatedItemNames && deactivatedItemNames.length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                Deactivated Items for this Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-600">
                {deactivatedItemNames.join(', ')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg"
        >
          View Running Order
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
