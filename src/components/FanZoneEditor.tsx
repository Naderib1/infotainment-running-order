import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, Save, Edit2, Check, X, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { 
  FanZoneSchedule, 
  FanZoneItem, 
  defaultFanZoneSchedule
} from '../data/fanZoneSchedule'
import { getCategoryPaletteEntry } from '../data/categoryPalette'

interface FanZoneEditorProps {
  schedule: FanZoneSchedule
  onSave: (schedule: FanZoneSchedule) => Promise<boolean>
  saving: boolean
}

// Map fan zone types to category indices for consistent palette
const typeToIndex: Record<FanZoneItem['type'], number> = {
  opening: 0,
  music: 1,
  match: 2,
  entertainment: 3,
  closing: 4
}

// Parse time string to minutes for sorting
// Supports formats: -01:30:00, +00:15:00, T-120, T-60, KO, HT, FT, etc.
const parseTime = (timeStr: string): number => {
  if (!timeStr) return 9999
  const s = timeStr.trim().toUpperCase()
  
  // Handle -HH:MM:SS or +HH:MM:SS format (e.g., -01:30:00, +00:15:00)
  const hhmmssMatch = s.match(/^([+-])?(\d{1,2}):(\d{2}):(\d{2})$/)
  if (hhmmssMatch) {
    const sign = hhmmssMatch[1] === '-' ? -1 : 1
    const hours = parseInt(hhmmssMatch[2], 10)
    const minutes = parseInt(hhmmssMatch[3], 10)
    return sign * (hours * 60 + minutes)
  }
  
  // Handle -HH:MM or +HH:MM format (e.g., -01:30, +00:15)
  const hhmmMatch = s.match(/^([+-])?(\d{1,2}):(\d{2})$/)
  if (hhmmMatch) {
    const sign = hhmmMatch[1] === '-' ? -1 : 1
    const hours = parseInt(hhmmMatch[2], 10)
    const minutes = parseInt(hhmmMatch[3], 10)
    return sign * (hours * 60 + minutes)
  }
  
  // Handle T-XXX format (e.g., T-120 = 120 minutes before KO)
  const tMinusMatch = s.match(/^T-(\d+)/)
  if (tMinusMatch) {
    return -parseInt(tMinusMatch[1], 10)
  }
  
  // Handle T+XXX format (e.g., T+10 = 10 minutes after KO)
  const tPlusMatch = s.match(/^T\+(\d+)/)
  if (tPlusMatch) {
    return parseInt(tPlusMatch[1], 10)
  }
  
  // Handle special markers
  if (s.includes('KO') && !s.includes('HT') && !s.includes('FT')) return 0
  if (s.includes('HT START') || s === 'HT START') return 45
  if (s.includes('HT WINDOW') || s === 'HT WINDOW') return 50
  if (s.includes('HT END') || s === 'HT END') return 55
  if (s.includes('2H') || s.includes('SECOND HALF')) return 60
  if (s.includes('FT')) return 90
  if (s.includes('INTER-MATCH')) return 100
  if (s.includes('AFTER FINAL')) return 110
  if (s.includes('CLOSE') || s.includes('CLOSURE')) return 120
  
  // Handle +XX format (e.g., +45 = 45 minutes after FT)
  const plusMatch = s.match(/^\+(\d+)/)
  if (plusMatch) {
    return 90 + parseInt(plusMatch[1], 10)
  }
  
  // Fallback: try to parse as HH:MM
  const parts = s.split(':').map(Number)
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1]
  }
  
  return 9999
}

function generateId(): string {
  return `fz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function FanZoneEditor({ schedule, onSave, saving }: FanZoneEditorProps) {
  const [localSchedule, setLocalSchedule] = useState<FanZoneSchedule>(schedule)
  const [hasChanges, setHasChanges] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<FanZoneItem>>({})

  // Sync local state when schedule prop changes (e.g., after save/reload)
  useEffect(() => {
    if (!hasChanges) {
      setLocalSchedule(schedule)
    }
  }, [schedule, hasChanges])

  // Sort items by time for display
  const sortedItems = useMemo(() => {
    console.log('Sorting items, count:', localSchedule.items.length)
    return [...localSchedule.items].sort((a, b) => parseTime(a.time) - parseTime(b.time))
  }, [localSchedule.items])

  const updateSchedule = (newSchedule: FanZoneSchedule) => {
    setLocalSchedule(newSchedule)
    setHasChanges(true)
  }

  const handleSave = async () => {
    const success = await onSave(localSchedule)
    if (success) {
      setHasChanges(false)
    }
  }

  const handleResetToDefaults = async () => {
    if (confirm('Reset to default schedule? This will replace all current items with the default template.')) {
      updateSchedule(defaultFanZoneSchedule)
    }
  }

  const addItem = () => {
    const newItem: FanZoneItem = {
      id: generateId(),
      type: 'music',
      time: '-00:00:00',
      title: 'New Item',
      screens: {
        screen1: '',
        screen2: '',
        screen3: ''
      }
    }
    console.log('Adding new item:', newItem)
    console.log('Current items count:', localSchedule.items.length)
    const newSchedule = { ...localSchedule, items: [...localSchedule.items, newItem] }
    console.log('New items count:', newSchedule.items.length)
    updateSchedule(newSchedule)
  }

  const deleteItem = (id: string) => {
    const newItems = localSchedule.items.filter(item => item.id !== id)
    updateSchedule({ ...localSchedule, items: newItems })
  }

  const updateItem = (id: string, updates: Partial<FanZoneItem>) => {
    const newItems = localSchedule.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    updateSchedule({ ...localSchedule, items: newItems })
  }

  const startEdit = (item: FanZoneItem) => {
    setEditingId(item.id)
    setEditingData({ ...item })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData({})
  }

  const saveEdit = () => {
    if (editingId && editingData) {
      updateItem(editingId, editingData)
      setEditingId(null)
      setEditingData({})
    }
  }

  const updateEditingData = (field: string, value: string) => {
    setEditingData(prev => ({ ...prev, [field]: value }))
  }

  const updateEditingScreen = (screen: 'screen1' | 'screen2' | 'screen3', value: string) => {
    setEditingData(prev => ({
      ...prev,
      screens: { ...(prev.screens || { screen1: '', screen2: '', screen3: '' }), [screen]: value }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Fan Zone Schedule Editor
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
            {localSchedule.items.length} items in schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleResetToDefaults}
            variant="outline"
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={addItem}
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Items List - Card Style like Games (sorted by time) */}
      <div className="space-y-4">
        {sortedItems.map((item) => {
          const idx = typeToIndex[item.type]
          const palette = getCategoryPaletteEntry(idx)
          const isEditing = editingId === item.id
          
          return (
            <Card
              key={item.id}
              className="glass-card border-0 overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Time Badge */}
                  <div
                    className={`${palette.timeClass} text-white p-4 flex items-center justify-center min-w-[100px]`}
                  >
                    <div className="text-center">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editingData.time || ''}
                          onChange={(e) => updateEditingData('time', e.target.value)}
                          className="w-24 text-center text-white bg-white/20 border-white/50 placeholder-white/70"
                          placeholder="Time"
                        />
                      ) : (
                        <div className="font-bold text-lg">
                          {item.time || '--:--'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4">
                        {isEditing ? (
                          <Input
                            value={editingData.title || ''}
                            onChange={(e) => updateEditingData('title', e.target.value)}
                            className="text-lg font-semibold"
                            placeholder="Enter title"
                          />
                        ) : (
                          <div className="inline-block bg-white shadow-md border border-slate-200 px-4 py-2 rounded-full">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {item.title || 'Untitled'}
                            </h4>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={saveEdit}
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEdit}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(item)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteItem(item.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 3 Columns Grid: On-Ground / Screens / Audio */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* On-Ground */}
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border-l-4 border-blue-500">
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2 tracking-wide">
                          On-Ground
                        </div>
                        {isEditing ? (
                          <textarea
                            value={editingData.screens?.screen1 || ''}
                            onChange={(e) => updateEditingScreen('screen1', e.target.value)}
                            className="w-full min-h-[80px] p-2 rounded border border-blue-200 bg-white text-sm resize-none"
                            placeholder="Operations / ground activities"
                          />
                        ) : (
                          <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
                            {item.screens.screen1 || '-'}
                          </div>
                        )}
                      </div>

                      {/* Screens */}
                      <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border-l-4 border-purple-500">
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-2 tracking-wide">
                          Screens
                        </div>
                        {isEditing ? (
                          <textarea
                            value={editingData.screens?.screen2 || ''}
                            onChange={(e) => updateEditingScreen('screen2', e.target.value)}
                            className="w-full min-h-[80px] p-2 rounded border border-purple-200 bg-white text-sm resize-none"
                            placeholder="Visual content"
                          />
                        ) : (
                          <div className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-line">
                            {item.screens.screen2 || '-'}
                          </div>
                        )}
                      </div>

                      {/* Audio */}
                      <div className="bg-pink-50 dark:bg-pink-900/30 p-3 rounded-lg border-l-4 border-pink-500">
                        <div className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase mb-2 tracking-wide">
                          Audio
                        </div>
                        {isEditing ? (
                          <textarea
                            value={editingData.screens?.screen3 || ''}
                            onChange={(e) => updateEditingScreen('screen3', e.target.value)}
                            className="w-full min-h-[80px] p-2 rounded border border-pink-200 bg-white text-sm resize-none"
                            placeholder="Sound / music"
                          />
                        ) : (
                          <div className="text-sm text-pink-800 dark:text-pink-200 whitespace-pre-line">
                            {item.screens.screen3 || '-'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {localSchedule.items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No items in schedule. Add your first item or reset to defaults.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={addItem} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button onClick={handleResetToDefaults} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
