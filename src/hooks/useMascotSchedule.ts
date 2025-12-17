import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface MascotEntry {
  cityId: string
  time: string
  note: string
}

export interface MascotScheduleData {
  // Key is date string (YYYY-MM-DD), value is array of entries
  schedule: Record<string, MascotEntry[]>
  updatedAt?: string
  updatedBy?: string
}

// Default schedule with all the provided data
const defaultMascotSchedule: MascotScheduleData = {
  schedule: {
    '2025-12-20': [
      { cityId: 'rabat1', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'fez', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'agadir', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
    ],
    '2025-12-21': [
      { cityId: 'rabat1', time: 'During game', note: 'GROUP STAGE: Morocco vs Comoros (KO 20:00)' },
    ],
    '2025-12-22': [
      { cityId: 'rabat2', time: 'During game', note: 'GROUP STAGE: Egypt vs Zimbabwe (KO 21:00)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-23': [
      { cityId: 'casablanca1', time: 'During game', note: 'GROUP STAGE: Tunisia vs Uganda (KO 21:00)' },
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-24': [
      { cityId: 'casablanca2', time: 'During game', note: 'GROUP STAGE: Cameroon vs Gabon (KO 21:00)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-25': [
      { cityId: 'marrakech', time: 'During game', note: 'GROUP STAGE: Morocco vs Sudan (KO 21:00)' },
      { cityId: 'tangier', time: 'Concert −00:45', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-26': [
      { cityId: 'tangier', time: 'During game', note: 'GROUP STAGE: Senegal vs Egypt (KO 21:00)' },
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-27': [
      { cityId: 'rabat2', time: 'During game', note: 'GROUP STAGE: Tunisia vs Cameroon (KO 19:00)' },
      { cityId: 'fez', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-28': [
      { cityId: 'casablanca1', time: 'During game', note: 'GROUP STAGE: Morocco vs Mali (KO 21:00)' },
      { cityId: 'agadir', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-29': [
      { cityId: 'casablanca2', time: 'During game', note: 'GROUP STAGE: Senegal vs Morocco (KO 19:00)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-30': [
      { cityId: 'tangier', time: 'During game', note: 'GROUP STAGE: Botswana vs DR Congo (KO 19:00)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2025-12-31': [
      { cityId: 'rabat2', time: 'During game', note: 'GROUP STAGE: Ghana vs Nigeria (KO 19:00)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-01': [
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-02': [
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-03': [
      { cityId: 'casablanca1', time: 'During game', note: 'ROUND OF 16: 2A v 2C (KO 20:00)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-04': [
      { cityId: 'casablanca2', time: 'During game', note: 'ROUND OF 16: 2B v 2F (KO 20:00)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-05': [
      { cityId: 'tangier', time: 'During game', note: 'ROUND OF 16: 1C v 3A/B/F (KO 20:00)' },
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-06': [
      { cityId: 'rabat2', time: 'During game', note: 'ROUND OF 16: 1F v 2E (KO 20:00)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-07': [
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-08': [
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
      { cityId: 'casablanca2', time: 'Concert −00:45', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-09': [
      { cityId: 'casablanca1', time: 'During game', note: 'QUARTER FINAL: W40 v W39 (KO 20:00)' },
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-10': [
      { cityId: 'casablanca2', time: 'During game', note: 'QUARTER FINAL: W41 v W44 (KO 20:00)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-11': [
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-12': [
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-13': [
      { cityId: 'marrakech', time: 'Concert −00:45', note: 'Non-match appearance (1h)' },
      { cityId: 'tangier', time: 'Concert −00:45', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-14': [
      { cityId: 'tangier', time: 'During game', note: 'SEMI-FINAL: W45 v W48 (SPECIAL)' },
      { cityId: 'rabat1', time: 'During game', note: 'SEMI-FINAL: W47 v W46 (SPECIAL)' },
    ],
    '2026-01-15': [
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-16': [
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-17': [
      { cityId: 'casablanca1', time: 'During game', note: '3RD PLACE MATCH (KO 17:00)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Non-match appearance (1h)' },
    ],
    '2026-01-18': [
      { cityId: 'rabat1', time: 'During game', note: 'FINAL: W49 v W50 (SPECIAL)' },
      { cityId: 'tangier', time: 'During game', note: 'FINAL: W49 v W50 (SPECIAL)' },
    ],
  }
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
