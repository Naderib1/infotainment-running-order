import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface MascotScheduleData {
  // Key is date string (YYYY-MM-DD), value is array of city IDs
  schedule: Record<string, string[]>
  updatedAt?: string
  updatedBy?: string
}

const defaultMascotSchedule: MascotScheduleData = {
  schedule: {}
}

export function useMascotSchedule() {
  const [data, setData] = useState<MascotScheduleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load the mascot schedule from Supabase
  const loadSchedule = useCallback(async () => {
    setLoading(true)
    try {
      const { data: result, error } = await supabase
        .from('fan_zone_schedule')
        .select('data')
        .eq('id', 'mascot-schedule')
        .single()

      if (result?.data) {
        setData(result.data as MascotScheduleData)
        setLoading(false)
        return result.data as MascotScheduleData
      }

      // Fallback to default if no Supabase data
      if (error || !result) {
        console.log('No mascot schedule in Supabase, using default...')
        setData(defaultMascotSchedule)
        setLoading(false)
        return defaultMascotSchedule
      }
    } catch (err) {
      console.error('Error loading mascot schedule:', err)
      setData(defaultMascotSchedule)
    } finally {
      setLoading(false)
    }
    return defaultMascotSchedule
  }, [])

  // Save schedule to Supabase (admin only)
  const saveSchedule = useCallback(async (newData: MascotScheduleData, userEmail?: string): Promise<boolean> => {
    setSaving(true)
    try {
      console.log('Saving mascot schedule...', { userEmail })
      
      const dataToSave: MascotScheduleData = {
        ...newData,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || 'unknown'
      }
      
      const { data: result, error } = await supabase
        .from('fan_zone_schedule')
        .upsert({
          id: 'mascot-schedule',
          data: dataToSave,
          updated_at: new Date().toISOString(),
          updated_by: userEmail || 'unknown'
        })
        .select()

      if (error) {
        console.error('Error saving mascot schedule:', error)
        alert(`Failed to save: ${error.message}`)
        return false
      }

      console.log('Mascot schedule saved successfully:', result)
      setData(dataToSave)
      return true
    } catch (err) {
      console.error('Error saving mascot schedule:', err)
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  useEffect(() => {
    loadSchedule()
  }, [loadSchedule])

  return { data, loading, saving, saveSchedule, reloadSchedule: loadSchedule }
}
