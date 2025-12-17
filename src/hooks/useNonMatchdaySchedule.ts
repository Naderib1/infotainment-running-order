import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { FanZoneSchedule, defaultNonMatchdaySchedule } from '@/data/fanZoneSchedule'

export function useNonMatchdaySchedule() {
  const [schedule, setSchedule] = useState<FanZoneSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load the non-matchday schedule from Supabase, fallback to default
  const loadSchedule = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('fan_zone_schedule')
        .select('data')
        .eq('id', 'non-matchday')
        .single()

      if (data?.data) {
        setSchedule(data.data as FanZoneSchedule)
        setLoading(false)
        return data.data as FanZoneSchedule
      }

      // Fallback to default if no Supabase data
      if (error || !data) {
        console.log('No non-matchday schedule in Supabase, using default...')
        setSchedule(defaultNonMatchdaySchedule)
        setLoading(false)
        return defaultNonMatchdaySchedule
      }
    } catch (err) {
      console.error('Error loading non-matchday schedule:', err)
      setSchedule(defaultNonMatchdaySchedule)
    } finally {
      setLoading(false)
    }
    return defaultNonMatchdaySchedule
  }, [])

  // Save schedule to Supabase (admin only)
  const saveSchedule = useCallback(async (newSchedule: FanZoneSchedule, userEmail?: string): Promise<boolean> => {
    setSaving(true)
    try {
      console.log('Saving non-matchday schedule...', { itemCount: newSchedule.items.length, userEmail })
      
      const { data, error } = await supabase
        .from('fan_zone_schedule')
        .upsert({
          id: 'non-matchday',
          data: newSchedule,
          updated_at: new Date().toISOString(),
          updated_by: userEmail || 'unknown'
        })
        .select()

      if (error) {
        console.error('Error saving non-matchday schedule:', error)
        alert(`Failed to save: ${error.message}`)
        return false
      }

      console.log('Non-matchday schedule saved successfully:', data)
      setSchedule(newSchedule)
      return true
    } catch (err) {
      console.error('Error saving non-matchday schedule:', err)
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  useEffect(() => {
    loadSchedule()
  }, [loadSchedule])

  return { schedule, loading, saving, saveSchedule, reloadSchedule: loadSchedule }
}
