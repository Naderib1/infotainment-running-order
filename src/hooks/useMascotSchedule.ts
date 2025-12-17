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
      { cityId: 'rabat1', time: '10:00', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'rabat2', time: '11:30', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'casablanca1', time: '13:00', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'casablanca2', time: '14:30', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'marrakech', time: '16:00', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'tangier', time: '17:30', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'fez', time: '19:00', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
      { cityId: 'agadir', time: '20:30', note: 'LAUNCH DAY: 1h appearance (all fan zones)' },
    ],
    '2025-12-21': [
      { cityId: 'rabat1', time: 'During game', note: 'During strongest game (KO 20:00): Morocco vs Comoros (includes T-1h10 + HT)' },
    ],
    '2025-12-22': [
      { cityId: 'tangier', time: 'During game', note: 'During strongest game (KO 21:00): Egypt vs Zimbabwe (includes T-1h10 + HT)' },
    ],
    '2025-12-23': [
      { cityId: 'casablanca1', time: 'During game', note: 'During strongest game (KO 21:00): Tunisia vs Uganda (includes T-1h10 + HT)' },
    ],
    '2025-12-24': [
      { cityId: 'casablanca2', time: 'During game', note: 'During strongest game (KO 21:00): Cameroon vs Gabon (includes T-1h10 + HT)' },
    ],
    '2025-12-25': [
      { cityId: 'tangier', time: 'Concert −00:45', note: 'Non-match day: Mascot appears 45 mins before concert start (1h)' },
      { cityId: 'marrakech', time: 'Concert −00:45', note: 'Non-match day: Mascot appears 45 mins before concert start (1h)' },
    ],
    '2025-12-26': [
      { cityId: 'marrakech', time: 'During game', note: 'During strongest game (KO 21:00): Morocco vs Mali (includes T-1h10 + HT)' },
    ],
    '2025-12-27': [
      { cityId: 'rabat2', time: 'During game', note: 'During strongest game (KO 21:00): Nigeria vs Tunisia (includes T-1h10 + HT)' },
    ],
    '2025-12-28': [
      { cityId: 'fez', time: 'During game', note: 'During strongest game (KO 21:00): Cote d\'Ivoire vs Cameroon (includes T-1h10 + HT)' },
    ],
    '2025-12-29': [
      { cityId: 'agadir', time: 'During game', note: 'During strongest game (KO 20:00): Comoros vs Mali (includes T-1h10 + HT)' },
    ],
    '2025-12-30': [
      { cityId: 'tangier', time: 'During game', note: 'During strongest game (KO 20:00): Botswana vs DR Congo (includes T-1h10 + HT)' },
    ],
    '2025-12-31': [
      { cityId: 'casablanca1', time: 'During game', note: 'During strongest game (KO 20:00): Mozambique vs Cameroon (includes T-1h10 + HT)' },
    ],
    '2026-01-01': [
      { cityId: 'none', time: '-', note: 'No fan-zone appearance (rest / travel / prep)' },
    ],
    '2026-01-02': [
      { cityId: 'none', time: '-', note: 'No fan-zone appearance (rest / travel / prep)' },
    ],
    '2026-01-03': [
      { cityId: 'casablanca2', time: 'During game', note: 'During strongest game (KO 20:00): 2A v 2C (includes T-1h10 + HT)' },
    ],
    '2026-01-04': [
      { cityId: 'marrakech', time: 'During game', note: 'During strongest game (KO 20:00): 2B v 2F (includes T-1h10 + HT)' },
    ],
    '2026-01-05': [
      { cityId: 'rabat2', time: 'During game', note: 'During strongest game (KO 20:00): 1C v 3A/B/F (includes T-1h10 + HT)' },
    ],
    '2026-01-06': [
      { cityId: 'tangier', time: 'During game', note: 'During strongest game (KO 20:00): 1F v 2E (includes T-1h10 + HT)' },
    ],
    '2026-01-07': [
      { cityId: 'none', time: '-', note: 'No fan-zone appearance (rest / travel / prep)' },
    ],
    '2026-01-08': [
      { cityId: 'casablanca2', time: 'Concert −00:45', note: 'Non-match day: Mascot appears 45 mins before concert start (1h)' },
      { cityId: 'tangier', time: 'Concert −00:45', note: 'Non-match day: Mascot appears 45 mins before concert start (1h)' },
    ],
    '2026-01-09': [
      { cityId: 'casablanca1', time: 'During game', note: 'During strongest game (KO 20:00): W40 v W39 (includes T-1h10 + HT)' },
    ],
    '2026-01-10': [
      { cityId: 'marrakech', time: 'During game', note: 'During strongest game (KO 20:00): W41 v 44 (includes T-1h10 + HT)' },
    ],
    '2026-01-11': [
      { cityId: 'none', time: '-', note: 'No fan-zone appearance (rest / travel / prep)' },
    ],
    '2026-01-12': [
      { cityId: 'none', time: '-', note: 'No fan-zone appearance (rest / travel / prep)' },
    ],
    '2026-01-13': [
      { cityId: 'tangier', time: 'Concert −00:45', note: 'Non-match day: Mascot appears 45 mins before concert start (1h)' },
      { cityId: 'marrakech', time: 'Concert −00:45', note: 'Non-match day: Mascot appears 45 mins before concert start (1h)' },
    ],
    '2026-01-14': [
      { cityId: 'tangier', time: 'During game', note: 'SPECIAL Semi-Final (KO 18:00): W45 v W48' },
      { cityId: 'rabat1', time: 'During game', note: 'SPECIAL Semi-Final (KO 21:00): W47 v W46' },
    ],
    '2026-01-15': [
      { cityId: 'none', time: '-', note: 'No fan-zone appearance (rest / travel / prep)' },
    ],
    '2026-01-16': [
      { cityId: 'none', time: '-', note: 'No fan-zone appearance (rest / travel / prep)' },
    ],
    '2026-01-17': [
      { cityId: 'casablanca1', time: 'During game', note: 'During strongest game (KO 17:00): L49 v L50 (includes T-1h10 + HT)' },
    ],
    '2026-01-18': [
      { cityId: 'tangier', time: '17:30', note: 'SPECIAL FINAL DAY: Pre-final hype & fan march (1h, non-overlapping slot)' },
      { cityId: 'rabat1', time: 'During game', note: 'SPECIAL FINAL (KO 20:00): W49 v W50' },
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
