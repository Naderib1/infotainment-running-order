import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { AppData } from '@/types'
import { ensureAppDataShape } from '@/lib/ensureShape'

export function useSupabaseData(initialData: AppData) {
  const { user, isConfigured } = useAuth()
  const [data, setData] = useState<AppData>(initialData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load data from Supabase
  const loadData = useCallback(async () => {
    if (!user || !isConfigured) {
      setLoading(false)
      return
    }

    try {
      const { data: userData, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (new user)
        console.error('Error loading data:', error)
      }

      if (userData?.data) {
        const normalized = ensureAppDataShape(userData.data)
        setData(normalized)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured])

  // Save data to Supabase
  const saveData = useCallback(async (newData: AppData) => {
    setData(newData)

    if (!user || !isConfigured) {
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          data: newData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving data:', error)
      } else {
        setLastSaved(new Date())
      }
    } catch (err) {
      console.error('Error saving data:', err)
    } finally {
      setSaving(false)
    }
  }, [user, isConfigured])

  // Load data when user changes
  useEffect(() => {
    if (user && isConfigured) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user, isConfigured, loadData])

  return {
    data,
    setData: saveData,
    loading,
    saving,
    lastSaved,
    reload: loadData
  }
}


