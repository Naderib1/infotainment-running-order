import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { AppData } from '@/types'
import { ensureAppDataShape } from '@/lib/ensureShape'

const FALLBACK_TEMPLATE_URL = '/default-template.json'

export function useDefaultTemplate() {
  const [template, setTemplate] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load the default template from Supabase, fallback to file
  const loadTemplate = useCallback(async () => {
    setLoading(true)
    try {
      // Try to get from Supabase first
      const { data, error } = await supabase
        .from('default_template')
        .select('data')
        .eq('id', 'main')
        .single()

      if (data?.data) {
        const normalized = ensureAppDataShape(data.data)
        setTemplate(normalized)
        setLoading(false)
        return normalized
      }

      // Fallback to file if no Supabase data
      if (error || !data) {
        console.log('No template in Supabase, loading from file...')
        const response = await fetch(FALLBACK_TEMPLATE_URL)
        if (response.ok) {
          const fileData = await response.json()
          const normalized = ensureAppDataShape(fileData)
          setTemplate(normalized)
          setLoading(false)
          return normalized
        }
      }
    } catch (err) {
      console.error('Error loading default template:', err)
      // Try file fallback
      try {
        const response = await fetch(FALLBACK_TEMPLATE_URL)
        if (response.ok) {
          const fileData = await response.json()
          const normalized = ensureAppDataShape(fileData)
          setTemplate(normalized)
        }
      } catch {
        console.error('Failed to load fallback template')
      }
    } finally {
      setLoading(false)
    }
    return null
  }, [])

  // Save template to Supabase (admin only)
  const saveTemplate = useCallback(async (newTemplate: AppData, userEmail?: string): Promise<boolean> => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('default_template')
        .upsert({
          id: 'main',
          data: newTemplate,
          updated_at: new Date().toISOString(),
          updated_by: userEmail || 'unknown'
        })

      if (error) {
        console.error('Error saving template:', error)
        return false
      }

      setTemplate(newTemplate)
      return true
    } catch (err) {
      console.error('Error saving template:', err)
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  useEffect(() => {
    loadTemplate()
  }, [loadTemplate])

  return { template, loading, saving, saveTemplate, reloadTemplate: loadTemplate }
}
