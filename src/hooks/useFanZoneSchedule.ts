import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { FanZoneSchedule, defaultFanZoneSchedule } from '@/data/fanZoneSchedule'

export function useFanZoneSchedule() {
  const [schedule, setSchedule] = useState<FanZoneSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load the fan zone schedule from Supabase, fallback to default
  const loadSchedule = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('fan_zone_schedule')
        .select('data')
        .eq('id', 'main')
        .single()

      if (data?.data) {
        setSchedule(data.data as FanZoneSchedule)
        setLoading(false)
        return data.data as FanZoneSchedule
      }

      // Fallback to default if no Supabase data
      if (error || !data) {
        console.log('No fan zone schedule in Supabase, using default...')
        setSchedule(defaultFanZoneSchedule)
        setLoading(false)
        return defaultFanZoneSchedule
      }
    } catch (err) {
      console.error('Error loading fan zone schedule:', err)
      setSchedule(defaultFanZoneSchedule)
    } finally {
      setLoading(false)
    }
    return defaultFanZoneSchedule
  }, [])

  // Save schedule to Supabase (admin only)
  const saveSchedule = useCallback(async (newSchedule: FanZoneSchedule, userEmail?: string): Promise<boolean> => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('fan_zone_schedule')
        .upsert({
          id: 'main',
          data: newSchedule,
          updated_at: new Date().toISOString(),
          updated_by: userEmail || 'unknown'
        })

      if (error) {
        console.error('Error saving fan zone schedule:', error)
        return false
      }

      setSchedule(newSchedule)
      return true
    } catch (err) {
      console.error('Error saving fan zone schedule:', err)
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
