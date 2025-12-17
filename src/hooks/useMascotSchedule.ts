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
      { cityId: 'rabat1', time: '19:00', note: 'Launch (non-match) – 1h' },
      { cityId: 'casablanca1', time: '21:00', note: 'Launch (non-match) – 1h' },
    ],
    '2025-12-21': [
      { cityId: 'rabat1', time: 'During game', note: 'Strongest game broadcast: Morocco vs Comoros (KO 20:00)' },
    ],
    '2025-12-22': [
      { cityId: 'tangier', time: 'During game', note: 'Strongest game broadcast: Egypt vs Zimbabwe (KO 21:00)' },
    ],
    '2025-12-23': [
      { cityId: 'casablanca2', time: 'During game', note: 'Strongest game broadcast: Tunisia vs Uganda (KO 21:00)' },
    ],
    '2025-12-24': [
      { cityId: 'marrakech', time: 'During game', note: 'Strongest game broadcast: Cameroon vs Gabon (KO 21:00)' },
    ],
    '2025-12-25': [
      { cityId: 'casablanca1', time: '19:00', note: 'Non-match – 1h' },
      { cityId: 'rabat2', time: '21:00', note: 'Non-match – 1h' },
    ],
    '2025-12-26': [
      { cityId: 'casablanca1', time: 'During game', note: 'Strongest game broadcast: Nigeria vs Sudan (KO 21:00)' },
    ],
    '2025-12-27': [
      { cityId: 'casablanca2', time: 'During game', note: 'Strongest game broadcast: Tunisia vs Cameroon (KO 21:00)' },
    ],
    '2025-12-28': [
      { cityId: 'marrakech', time: 'During game', note: 'Strongest game broadcast: Morocco vs Mali (KO 21:00)' },
    ],
    '2025-12-29': [
      { cityId: 'tangier', time: 'During game', note: 'Strongest game broadcast: Comoros vs Algeria (KO 15:30)' },
    ],
    '2025-12-30': [
      { cityId: 'rabat2', time: 'During game', note: 'Strongest game broadcast: Senegal vs Zambia (KO 21:00)' },
    ],
    '2025-12-31': [
      { cityId: 'casablanca1', time: 'During game', note: 'Strongest game broadcast: Ghana vs Nigeria (KO 21:00)' },
    ],
    '2026-01-01': [
      { cityId: 'casablanca2', time: '19:00', note: 'Non-match – 1h' },
      { cityId: 'marrakech', time: '21:00', note: 'Non-match – 1h' },
    ],
    '2026-01-02': [
      { cityId: 'tangier', time: '19:00', note: 'Non-match – 1h' },
      { cityId: 'casablanca1', time: '21:00', note: 'Non-match – 1h' },
    ],
    '2026-01-03': [
      { cityId: 'marrakech', time: 'During game', note: 'Strongest game broadcast: 2A v 2C (KO 20:00)' },
    ],
    '2026-01-04': [
      { cityId: 'casablanca2', time: 'During game', note: 'Strongest game broadcast: 2B v 2F (KO 20:00)' },
    ],
    '2026-01-05': [
      { cityId: 'tangier', time: 'During game', note: 'Strongest game broadcast: 1C v 3A/B/F (KO 20:00)' },
    ],
    '2026-01-06': [
      { cityId: 'casablanca1', time: 'During game', note: 'Strongest game broadcast: 1F v 2E (KO 20:00)' },
    ],
    '2026-01-07': [
      { cityId: 'rabat2', time: '19:00', note: 'Non-match – 1h' },
      { cityId: 'casablanca2', time: '21:00', note: 'Non-match – 1h' },
    ],
    '2026-01-08': [
      { cityId: 'marrakech', time: '19:00', note: 'Non-match – 1h' },
      { cityId: 'tangier', time: '21:00', note: 'Non-match – 1h' },
    ],
    '2026-01-09': [
      { cityId: 'casablanca1', time: 'During game', note: 'Strongest game broadcast: W40 v W39 (KO 20:00)' },
    ],
    '2026-01-10': [
      { cityId: 'casablanca2', time: 'During game', note: 'Strongest game broadcast: W41 v 44 (KO 20:00)' },
    ],
    '2026-01-11': [
      { cityId: 'rabat2', time: '19:00', note: 'Non-match – 1h' },
    ],
    '2026-01-12': [
      { cityId: 'fez', time: '19:00', note: 'Non-match – 1h (Fez day = only 1 slot)' },
    ],
    '2026-01-13': [
      { cityId: 'agadir', time: '19:00', note: 'Non-match – 1h (Agadir day = only 1 slot)' },
    ],
    '2026-01-14': [
      { cityId: 'rabat1', time: 'During game', note: 'SPECIAL: Semi-final night – strongest SF (KO 21:00)' },
      { cityId: 'tangier', time: 'During game', note: 'SPECIAL: Semi-final night – other SF (KO 18:00)' },
    ],
    '2026-01-15': [
      { cityId: 'casablanca1', time: '19:00', note: 'Non-match – 1h' },
      { cityId: 'marrakech', time: '21:00', note: 'Non-match – 1h' },
    ],
    '2026-01-16': [
      { cityId: 'rabat2', time: '19:00', note: 'Non-match – 1h' },
      { cityId: 'marrakech', time: '21:00', note: 'Non-match – 1h' },
    ],
    '2026-01-17': [
      { cityId: 'tangier', time: 'During game', note: 'Strongest game broadcast: L49 v L50 (KO 17:00)' },
    ],
    '2026-01-18': [
      { cityId: 'rabat1', time: 'During game', note: 'SPECIAL: FINAL (KO 20:00)' },
      { cityId: 'tangier', time: 'During game', note: 'SPECIAL: FINAL (KO 20:00)' },
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
