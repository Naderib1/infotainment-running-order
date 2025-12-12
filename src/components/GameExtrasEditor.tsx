import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Game } from '@/data/games'
import { GameExtras } from '@/hooks/useGameExtras'
import { Users, Star, Eye, Plus, X, Save, Loader2 } from 'lucide-react'

interface GameExtrasEditorProps {
  game: Game
  extras?: GameExtras
  onSave: (data: { influencers: string[]; legends: string[]; playersToWatch: string[] }) => Promise<boolean>
  saving?: boolean
}

export function GameExtrasEditor({ game, extras, onSave, saving }: GameExtrasEditorProps) {
  const [influencers, setInfluencers] = useState<string[]>(extras?.influencers || [])
  const [legends, setLegends] = useState<string[]>(extras?.legends || [])
  const [playersToWatch, setPlayersToWatch] = useState<string[]>(extras?.players_to_watch || [])
  
  const [newInfluencer, setNewInfluencer] = useState('')
  const [newLegend, setNewLegend] = useState('')
  const [newPlayer, setNewPlayer] = useState('')

  // Update state when extras change
  useEffect(() => {
    setInfluencers(extras?.influencers || [])
    setLegends(extras?.legends || [])
    setPlayersToWatch(extras?.players_to_watch || [])
  }, [extras])

  const handleAddInfluencer = () => {
    if (newInfluencer.trim()) {
      setInfluencers([...influencers, newInfluencer.trim()])
      setNewInfluencer('')
    }
  }

  const handleAddLegend = () => {
    if (newLegend.trim()) {
      setLegends([...legends, newLegend.trim()])
      setNewLegend('')
    }
  }

  const handleAddPlayer = () => {
    if (newPlayer.trim()) {
      setPlayersToWatch([...playersToWatch, newPlayer.trim()])
      setNewPlayer('')
    }
  }

  const handleRemoveInfluencer = (index: number) => {
    setInfluencers(influencers.filter((_, i) => i !== index))
  }

  const handleRemoveLegend = (index: number) => {
    setLegends(legends.filter((_, i) => i !== index))
  }

  const handleRemovePlayer = (index: number) => {
    setPlayersToWatch(playersToWatch.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    const success = await onSave({ influencers, legends, playersToWatch })
    if (success) {
      alert('✅ Game extras saved successfully!')
    } else {
      alert('❌ Failed to save. Please try again.')
    }
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Match Info for {game.teamA} vs {game.teamB}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Influencers */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-purple-700">
            <Users className="h-4 w-4" />
            Influencers
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {influencers.map((name, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm"
              >
                {name}
                <button 
                  onClick={() => handleRemoveInfluencer(index)}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newInfluencer}
              onChange={(e) => setNewInfluencer(e.target.value)}
              placeholder="Add influencer name..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddInfluencer()}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleAddInfluencer}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legends */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-amber-700">
            <Star className="h-4 w-4" />
            Legends
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {legends.map((name, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-sm"
              >
                {name}
                <button 
                  onClick={() => handleRemoveLegend(index)}
                  className="hover:bg-amber-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newLegend}
              onChange={(e) => setNewLegend(e.target.value)}
              placeholder="Add legend name..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddLegend()}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleAddLegend}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Players to Watch */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-blue-700">
            <Eye className="h-4 w-4" />
            Players to Watch
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {playersToWatch.map((name, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
              >
                {name}
                <button 
                  onClick={() => handleRemovePlayer(index)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              placeholder="Add player name..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleAddPlayer}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Match Info
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
