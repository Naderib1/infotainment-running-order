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

// Default schedule with all the provided data (from screenshots)
const defaultMascotSchedule: MascotScheduleData = {
  schedule: {
    '2025-12-20': [
      { cityId: 'rabat1', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: Mascot appearance (1h)' },
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: Mascot appearance (1h)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: Mascot appearance (1h)' },
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: Mascot appearance (1h)' },
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: Mascot appearance (1h)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: Mascot appearance (1h)' },
      { cityId: 'fez', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: Mascot appearance (1h)' },
      { cityId: 'agadir', time: 'Before the Main Entertainment', note: 'LAUNCH DAY: Mascot appearance (1h)' },
    ],
    '2025-12-21': [
      { cityId: 'rabat1', time: 'During game', note: 'GROUP STAGE: Morocco vs Comoros (KO 20:00, Prince Moulay Abdellah Stadium)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2025-12-22': [
      { cityId: 'rabat2', time: 'During game', note: 'GROUP STAGE: Tunisia vs Uganda (KO 21:00, Prince Moulay Abdellah Olympic Annex Stadium)' },
      { cityId: 'casablanca2', time: 'During game', note: 'GROUP STAGE: Mali vs Zambia (KO 15:00, Mohammed V Stadium)' },
    ],
    '2025-12-23': [
      { cityId: 'marrakech', time: 'During game', note: 'GROUP STAGE: South Africa vs Angola (KO 18:00, Marrakech Grand Stadium)' },
      { cityId: 'tangier', time: 'During game', note: 'GROUP STAGE: Senegal vs Botswana (KO 16:00, Tangier Grand Stadium)' },
    ],
    '2025-12-24': [
      { cityId: 'fez', time: 'During game', note: 'GROUP STAGE: Nigeria vs Tanzania (KO 18:30, Fes Sports Complex Stadium)' },
      { cityId: 'agadir', time: 'During game', note: 'GROUP STAGE: Egypt vs Zimbabwe (KO 21:00, Adrar Stadium)' },
    ],
    '2025-12-25': [
      { cityId: 'rabat1', time: 'During game', note: 'GROUP STAGE: Nigeria vs Tunisia (KO 21:00, Prince Moulay Abdellah Olympic Annex Stadium)' },
      { cityId: 'casablanca1', time: 'During game', note: 'GROUP STAGE: Algeria vs Sudan (KO 16:00, Prince Moulay El Hassan Stadium)' },
    ],
    '2025-12-26': [
      { cityId: 'rabat2', time: 'During game', note: 'GROUP STAGE: Burkina Faso vs DR Congo (KO 21:00, Prince Moulay Abdellah Stadium)' },
      { cityId: 'casablanca2', time: 'During game', note: 'GROUP STAGE: Morocco vs Zambia (KO 18:00, Mohammed V Stadium)' },
    ],
    '2025-12-27': [
      { cityId: 'marrakech', time: 'During game', note: 'GROUP STAGE: Morocco vs Uganda (KO 15:00, Marrakech Grand Stadium)' },
      { cityId: 'tangier', time: 'During game', note: 'GROUP STAGE: Senegal vs DR Congo (KO 18:00, Tangier Grand Stadium)' },
    ],
    '2025-12-28': [
      { cityId: 'fez', time: 'During game', note: 'GROUP STAGE: Nigeria vs Tunisia (KO 15:00, Fes Sports Complex Stadium)' },
      { cityId: 'agadir', time: 'During game', note: 'GROUP STAGE: Egypt vs South Africa (KO 18:00, Adrar Stadium)' },
    ],
    '2025-12-29': [
      { cityId: 'rabat1', time: 'During game', note: 'GROUP STAGE: Morocco vs Mali (KO 21:00, Prince Moulay Abdellah Stadium)' },
      { cityId: 'casablanca1', time: 'During game', note: 'GROUP STAGE: Burkina Faso vs Equatorial Guinea (KO 13:30 ignored → next strongest used if available)' },
    ],
    '2025-12-30': [
      { cityId: 'rabat2', time: 'During game', note: 'GROUP STAGE: Senegal vs Zambia (KO 21:00, Prince Moulay Abdellah Stadium)' },
      { cityId: 'casablanca2', time: 'During game', note: 'GROUP STAGE: Morocco vs DR Congo (KO 16:00, Mohammed V Stadium)' },
    ],
    '2025-12-31': [
      { cityId: 'marrakech', time: 'During game', note: 'GROUP STAGE: Ghana vs Senegal (KO 18:00, Marrakech Grand Stadium)' },
      { cityId: 'tangier', time: 'During game', note: 'GROUP STAGE: Senegal vs Morocco (KO 21:00, Tangier Grand Stadium)' },
    ],
    '2026-01-01': [
      { cityId: 'fez', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'agadir', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-02': [
      { cityId: 'rabat1', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'casablanca1', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-03': [
      { cityId: 'rabat2', time: 'During game', note: 'ROUND OF 16: 2A v 2C (KO 20:00, Prince Moulay Abdellah Stadium)' },
      { cityId: 'casablanca2', time: 'During game', note: 'ROUND OF 16: 1D v 3B/E/F (KO 17:00, Mohammed V Stadium)' },
    ],
    '2026-01-04': [
      { cityId: 'marrakech', time: 'During game', note: 'ROUND OF 16: 2B v 2F (KO 20:00, Marrakech Grand Stadium)' },
      { cityId: 'tangier', time: 'During game', note: 'ROUND OF 16: 1A v 3C/D/E (KO 17:00, Tangier Grand Stadium)' },
    ],
    '2026-01-05': [
      { cityId: 'fez', time: 'During game', note: 'ROUND OF 16: 1E v 2D (KO 17:00, Fes Sports Complex Stadium)' },
      { cityId: 'agadir', time: 'During game', note: 'ROUND OF 16: 1F v 2E (KO 20:00, Adrar Stadium)' },
    ],
    '2026-01-06': [
      { cityId: 'rabat1', time: 'During game', note: 'ROUND OF 16: 1B v 3A/C/D (KO 17:00, Prince Moulay Abdellah Stadium)' },
      { cityId: 'casablanca1', time: 'During game', note: 'ROUND OF 16: 1C v 3A/B/F (KO 20:00, Mohammed V Stadium)' },
    ],
    '2026-01-07': [
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-08': [
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-09': [
      { cityId: 'fez', time: 'During game', note: 'QUARTER FINAL: W43 v W42 (KO 17:00, Fes Sports Complex Stadium)' },
      { cityId: 'agadir', time: 'During game', note: 'QUARTER FINAL: W40 v W39 (KO 20:00, Adrar Stadium)' },
    ],
    '2026-01-10': [
      { cityId: 'rabat1', time: 'During game', note: 'QUARTER FINAL: W41 v W44 (KO 20:00, Prince Moulay Abdellah Stadium)' },
      { cityId: 'casablanca1', time: 'During game', note: 'QUARTER FINAL: W38 v W37 (KO 17:00, Mohammed V Stadium)' },
    ],
    '2026-01-11': [
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-12': [
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-13': [
      { cityId: 'fez', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'agadir', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-14': [
      { cityId: 'tangier', time: 'During game', note: 'SEMI FINAL SPECIAL: W47 v W46 (KO 21:00, Tangier Grand Stadium)' },
      { cityId: 'rabat1', time: 'During game', note: 'SEMI FINAL SPECIAL: W45 v W48 (KO 18:00, Prince Moulay Abdellah Stadium)' },
    ],
    '2026-01-15': [
      { cityId: 'rabat2', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'casablanca2', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-16': [
      { cityId: 'marrakech', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-17': [
      { cityId: 'fez', time: 'During game', note: '3RD PLACE: L49 v L50 (KO 17:00, Fes Sports Complex Stadium)' },
      { cityId: 'agadir', time: 'Before the Main Entertainment', note: 'Mascot appearance (1h)' },
    ],
    '2026-01-18': [
      { cityId: 'rabat1', time: 'During game', note: 'FINAL SPECIAL: W49 V W50 (KO 20:00, Prince Moulay Abdellah Stadium)' },
      { cityId: 'tangier', time: 'Before the Main Entertainment', note: 'FINAL SPECIAL: Mascot appearance (1h)' },
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
