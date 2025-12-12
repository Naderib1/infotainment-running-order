import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface GameExtras {
  game_id: string
  influencers: string[]
  legends: string[]
  players_to_watch: string[]
  trivia_moments: string[]
  deactivated_items: string[] // IDs of running order items to hide for this game
}

export function useGameExtras() {
  const [extras, setExtras] = useState<Record<string, GameExtras>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load all game extras
  const loadExtras = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('game_extras')
        .select('*')

      if (error) {
        console.error('Error loading game extras:', error)
        return
      }

      const extrasMap: Record<string, GameExtras> = {}
      data?.forEach(item => {
        extrasMap[item.game_id] = {
          game_id: item.game_id,
          influencers: item.influencers || [],
          legends: item.legends || [],
          players_to_watch: item.players_to_watch || [],
          trivia_moments: item.trivia_moments || [],
          deactivated_items: item.deactivated_items || []
        }
      })
      setExtras(extrasMap)
    } catch (err) {
      console.error('Error loading game extras:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExtras()
  }, [loadExtras])

  // Save game extras
  const saveGameExtras = async (
    gameId: string, 
    data: { influencers?: string[]; legends?: string[]; playersToWatch?: string[]; triviaMoments?: string[]; deactivatedItems?: string[] },
    userEmail?: string
  ): Promise<boolean> => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('game_extras')
        .upsert({
          game_id: gameId,
          influencers: data.influencers || [],
          legends: data.legends || [],
          players_to_watch: data.playersToWatch || [],
          trivia_moments: data.triviaMoments || [],
          deactivated_items: data.deactivatedItems || [],
          updated_at: new Date().toISOString(),
          updated_by: userEmail || null
        }, {
          onConflict: 'game_id'
        })

      if (error) {
        console.error('Error saving game extras:', error)
        return false
      }

      // Update local state
      setExtras(prev => ({
        ...prev,
        [gameId]: {
          game_id: gameId,
          influencers: data.influencers || [],
          legends: data.legends || [],
          players_to_watch: data.playersToWatch || [],
          trivia_moments: data.triviaMoments || [],
          deactivated_items: data.deactivatedItems || []
        }
      }))

      return true
    } catch (err) {
      console.error('Error saving game extras:', err)
      return false
    } finally {
      setSaving(false)
    }
  }

  // Get extras for a specific game
  const getGameExtras = (gameId: string): GameExtras | undefined => {
    return extras[gameId]
  }

  return {
    extras,
    loading,
    saving,
    saveGameExtras,
    getGameExtras,
    reload: loadExtras
  }
}
