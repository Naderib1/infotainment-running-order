import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RunningOrderItem, RunningOrderCategory } from '@/types'
import { getCategoryPaletteEntry } from '@/data/categoryPalette'
import { Edit2, Trash2, Check, X, Eye, EyeOff } from 'lucide-react'

interface RunningOrderCardsProps {
  items: RunningOrderItem[]
  categories: RunningOrderCategory[]
  onUpdateItem: (id: string, updates: Partial<RunningOrderItem>) => void
  onDeleteItem: (id: string) => void
  onAddItemForCategory?: (categoryId: string) => void
  mode?: 'interactive' | 'presentation'
  readOnly?: boolean
}

export function RunningOrderCards({
  items,
  categories,
  onUpdateItem,
  onDeleteItem,
  onAddItemForCategory,
  mode = 'interactive',
  readOnly = false
}: RunningOrderCardsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<RunningOrderItem>>({})
  const isPresentation = mode === 'presentation'
  const editingEnabled = !isPresentation && !readOnly
  const editingItemId = editingEnabled ? editingId : null

  // Shared time parser for consistent ordering
  const parseTime = (timeStr: string) => {
    if (timeStr.startsWith('-')) {
      const cleanTime = timeStr.replace(/^-/, '')
      const [hours, minutes] = cleanTime.split(':').map(Number)
      return -(hours * 60 + minutes)
    } else if (timeStr.startsWith('+')) {
      const cleanTime = timeStr.replace(/^\+/, '')
      const [hours, minutes] = cleanTime.split(':').map(Number)
      return 1000 + (hours * 60 + minutes)
    } else if (timeStr.startsWith('HT+')) {
      const cleanTime = timeStr.replace(/^HT\+/, '')
      const [hours, minutes] = cleanTime.split(':').map(Number)
      return 2000 + (hours * 60 + minutes)
    } else if (timeStr.startsWith('FT+')) {
      const cleanTime = timeStr.replace(/^FT\+/, '')
      const [hours, minutes] = cleanTime.split(':').map(Number)
      return 3000 + (hours * 60 + minutes)
    } else {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return 4000 + (hours * 60 + minutes)
    }
  }

  // Sort items by time (most negative first, then positive)
  const sortItemsByTime = (list: RunningOrderItem[]) =>
    [...list].sort((a, b) => parseTime(a.time) - parseTime(b.time))

  // Only show active items in the main timeline
  const visibleItems = items.filter(item => item.active !== false)

  const getCategoryIndex = (categoryId: string) => {
    const idx = categories.findIndex(c => c.id === categoryId)
    return idx === -1 ? 0 : idx
  }

  const getCategoryPalette = (categoryId: string) => {
    return getCategoryPaletteEntry(getCategoryIndex(categoryId))
  }

  // Group items by category and sort within each category,
  // and then sort categories by earliest item time so the
  // whole view is ordered by time.
  const groupedItems = categories
    .map(category => {
      const categoryItems = sortItemsByTime(
        visibleItems.filter(item => item.category === category.id)
      )
      return {
        category,
        items: categoryItems,
        earliestScore:
          categoryItems.length > 0
            ? parseTime(categoryItems[0].time)
            : Number.POSITIVE_INFINITY
      }
    })
    .filter(group => group.items.length > 0)
    .sort((a, b) => a.earliestScore - b.earliestScore)

  const startEdit = (item: RunningOrderItem) => {
    if (!editingEnabled) return
    setEditingId(item.id)
    setEditingData(item)
  }

  const cancelEdit = () => {
    if (!editingEnabled) return
    setEditingId(null)
    setEditingData({})
  }

  const saveEdit = () => {
    if (!editingEnabled) return
    if (editingId && editingData) {
      onUpdateItem(editingId, editingData)
      setEditingId(null)
      setEditingData({})
    }
  }

  const updateEditingData = (field: string, value: any) => {
    if (!editingEnabled) return
    setEditingData(prev => ({ ...prev, [field]: value }))
  }

  const getTimeStripColorForCategory = (categoryId: string) => {
    const palette = getCategoryPalette(categoryId)
    return palette.timeClass
  }

  if (visibleItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No items added yet. Add your first running order item above.</p>
      </div>
    )
  }

  return (
    <div className={isPresentation ? '' : 'space-y-10'}>
      {groupedItems.map(({ category, items: categoryItems }) => {
        const palette = getCategoryPalette(category.id)
        return (
          <div
            key={category.id}
            className={`category-section ${isPresentation ? '' : 'space-y-4'}`}
            data-export-section={isPresentation ? 'category' : undefined}
            style={isPresentation ? {
              pageBreakBefore: 'always',
              breakBefore: 'page',
              paddingTop: '8mm',
              paddingBottom: '6mm',
              display: 'block',
              marginTop: 0
            } : undefined}
          >
            <div
              className="relative overflow-hidden rounded-xl shadow-lg text-white category-banner"
              data-export-chunk={isPresentation ? 'true' : undefined}
              style={{
                background: `linear-gradient(120deg, ${palette.bannerFrom}, ${palette.bannerTo})`,
                ...(isPresentation ? {
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  pageBreakAfter: 'avoid',
                  breakAfter: 'avoid',
                  marginBottom: '5mm'
                } : {})
              }}
            >
              <div className="absolute inset-0 opacity-30">
                <div className="absolute -top-10 -left-6 w-32 h-32 rounded-full bg-white/30 blur-3xl" />
                <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              </div>
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                    Category
                  </p>
                  <h3 className="text-2xl font-semibold">{category.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Items
                  </p>
                  <p className="text-lg font-bold">
                    {categoryItems.length}
                  </p>
                </div>
              </div>
            </div>
            {!isPresentation && onAddItemForCategory && (
              <div className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => onAddItemForCategory(category.id)}
                >
                  + Add Item
                </Button>
              </div>
            )}
          <div className={isPresentation ? '' : 'space-y-4'}>
            {categoryItems.map((item) => (
              <Card
                key={item.id}
                data-export-chunk={isPresentation ? 'true' : undefined}
                className={`glass-card border-0 overflow-hidden running-order-card ${
                  item.active === false ? 'opacity-50' : ''
                }`}
                style={isPresentation ? {
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  marginBottom: '5mm',
                  display: 'block'
                } : undefined}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Time Badge */}
                    <div
                      className={`${getTimeStripColorForCategory(
                        category.id
                      )} text-white p-4 flex items-center justify-center min-w-[100px]`}
                    >
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {editingItemId === item.id ? (
                            <Input
                              type="text"
                              value={editingData.time || ''}
                              onChange={(e) => updateEditingData('time', e.target.value)}
                              className="w-20 text-center text-white bg-transparent border-white placeholder-white/70"
                              placeholder="Time"
                            />
                          ) : (
                            item.time
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 mr-4">
                          <div className="inline-block bg-white shadow-md border border-slate-200 px-4 py-2 rounded-full">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {editingItemId === item.id ? (
                                <Input
                                  value={editingData.title || ''}
                                  onChange={(e) => updateEditingData('title', e.target.value)}
                                  className="text-lg font-semibold w-full border-none focus-visible:ring-0 px-0"
                                  placeholder="Enter title"
                                />
                              ) : (
                                item.title || 'Untitled'
                              )}
                            </h4>
                          </div>
                        </div>
                        {!isPresentation && (
                          <div className="flex items-center gap-2">
                            {editingItemId === item.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    onUpdateItem(item.id, { active: item.active === false ? true : false })
                                  }
                                  className={`h-8 w-8 ${
                                    item.active === false
                                      ? 'text-green-600 hover:text-green-700 hover:bg-green-100'
                                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  {item.active === false ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
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
                                  onClick={() => onDeleteItem(item.id)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Main content area with script and details */}
                      <div className="flex gap-4">
                        {item.script1 || editingItemId === item.id ? (
                          <>
                            {/* Script section - takes most space when script exists */}
                            <div className="flex-1">
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-blue-500">
                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase mb-2 tracking-wide">
                                  Script
                                </div>
                                <div className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                  {editingItemId === item.id ? (
                                    <textarea
                                      value={editingData.script1 ?? item.script1 ?? ''}
                                      onChange={(e) => updateEditingData('script1', e.target.value)}
                                      className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background resize-none text-lg font-medium"
                                      placeholder="Enter mixed Arabic + English script using tokens like [TeamA-L1], [TeamA-L2], [Stadium-L1]..."
                                    />
                                  ) : (
                                    <div 
                                      className="whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{
                                        __html: (item.script1 || '').replace(
                                          /\(([^)]+)\)/g,
                                          '<span style="font-style: italic; color: #3b82f6; font-weight: 600;">($1)</span>'
                                        )
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Details section - single column on the right */}
                            <div className="w-full max-w-[200px] flex-shrink-0">
                              <div className="flex flex-col gap-2">
                                {/* Giant Screen */}
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                                    Giant Screen
                                  </div>
                                  <div className="text-xs text-purple-800 dark:text-purple-200">
                                    {editingItemId === item.id ? (
                                      <Input
                                        value={editingData.giantScreen || ''}
                                        onChange={(e) => updateEditingData('giantScreen', e.target.value)}
                                        placeholder="Screen content"
                                        className="text-xs h-6"
                                      />
                                    ) : (
                                      item.giantScreen || 'Logo Loop'
                                    )}
                                  </div>
                                </div>

                                {/* Pitch LED */}
                                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                    Pitch LED
                                  </div>
                                  <div className="text-xs text-indigo-800 dark:text-indigo-200">
                                    {editingItemId === item.id ? (
                                      <Input
                                        value={editingData.pitchLed ?? item.pitchLed ?? ''}
                                        onChange={(e) =>
                                          updateEditingData('pitchLed', e.target.value)
                                        }
                                        placeholder="Perimeter LED"
                                        className="text-xs h-6"
                                      />
                                    ) : (
                                      item.pitchLed || 'Name of Competition'
                                    )}
                                  </div>
                                </div>

                                {/* Ring LED */}
                                <div className="bg-sky-100 dark:bg-sky-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                                    Ring LED
                                  </div>
                                  <div className="text-xs text-sky-800 dark:text-sky-200">
                                    {editingItemId === item.id ? (
                                      <Input
                                        value={editingData.ledRing ?? item.ledRing ?? ''}
                                        onChange={(e) =>
                                          updateEditingData('ledRing', e.target.value)
                                        }
                                        placeholder="Ring content"
                                        className="text-xs h-6"
                                      />
                                    ) : (
                                      item.ledRing || 'Name of Competition'
                                    )}
                                  </div>
                                </div>

                                {/* Graphics Produced */}
                                <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                                    Graphics Produced
                                  </div>
                                  <div className="text-xs text-pink-800 dark:text-pink-200">
                                    {editingItemId === item.id ? (
                                      <Input
                                        value={editingData.graphicsProduced ?? item.graphicsProduced ?? ''}
                                        onChange={(e) =>
                                          updateEditingData('graphicsProduced', e.target.value)
                                        }
                                        placeholder="Graphics"
                                        className="text-xs h-6"
                                      />
                                    ) : (
                                      item.graphicsProduced || '—'
                                    )}
                                  </div>
                                </div>

                                {/* Lights */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                                    Lights
                                  </div>
                                  <div className="text-xs text-yellow-800 dark:text-yellow-200">
                                    {editingItemId === item.id ? (
                                      <Input
                                        value={editingData.lights ?? item.lights ?? ''}
                                        onChange={(e) =>
                                          updateEditingData('lights', e.target.value)
                                        }
                                        placeholder="Lighting"
                                        className="text-xs h-6"
                                      />
                                    ) : (
                                      item.lights || 'Normal'
                                    )}
                                  </div>
                                </div>

                                {/* Duration */}
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                    Duration
                                  </div>
                                  <div className="text-xs text-blue-800 dark:text-blue-200">
                                    {editingItemId === item.id ? (
                                      <Input
                                        value={editingData.duration || ''}
                                        onChange={(e) => updateEditingData('duration', e.target.value)}
                                        placeholder="Duration"
                                        className="text-xs h-6"
                                      />
                                    ) : (
                                      item.duration || '1 min'
                                    )}
                                  </div>
                                </div>

                                {/* Responsible */}
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                                    Responsible
                                  </div>
                                  <div className="text-xs text-green-800 dark:text-green-200">
                                    {editingItemId === item.id ? (
                                      <Input
                                        value={editingData.responsible || ''}
                                        onChange={(e) => updateEditingData('responsible', e.target.value)}
                                        placeholder="Who"
                                        className="text-xs h-6"
                                      />
                                    ) : (
                                      item.responsible || 'Operator'
                                    )}
                                  </div>
                                </div>

                                {/* Notes */}
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                                    Notes
                                  </div>
                                  <div className="text-xs text-purple-800 dark:text-purple-200">
                                    {editingItemId === item.id ? (
                                      <Input
                                        value={editingData.notes || ''}
                                        onChange={(e) => updateEditingData('notes', e.target.value)}
                                        placeholder="Notes"
                                        className="text-xs h-6"
                                      />
                                    ) : (
                                      item.notes || '—'
                                    )}
                                  </div>
                                </div>

                                {/* Audio */}
                                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                                    Audio
                                  </div>
                                  <div className="text-xs text-orange-800 dark:text-orange-200">
                                    {editingItemId === item.id ? (
                                      <div className="space-y-0.5">
                                        {['Audio Only', 'MC Audio', 'DJ', 'Microphone', 'Video Audio'].map(
                                          (source) => {
                                            const current = (editingData.audioSources ??
                                              item.audioSources ??
                                              []) as string[]
                                            const checked = current.includes(source)
                                            return (
                                              <label
                                                key={source}
                                                className="flex items-center space-x-1 text-[10px]"
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={checked}
                                                  onChange={(e) => {
                                                    const nextSources = e.target.checked
                                                      ? [...current, source]
                                                      : current.filter((s) => s !== source)
                                                    updateEditingData('audioSources', nextSources)
                                                    updateEditingData('audio', nextSources.length > 0)
                                                    updateEditingData(
                                                      'audioOption',
                                                      nextSources.length > 0
                                                        ? nextSources.join(', ')
                                                        : 'No audio'
                                                    )
                                                  }}
                                                  className="w-3 h-3"
                                                />
                                                <span>{source}</span>
                                              </label>
                                            )
                                          }
                                        )}
                                      </div>
                                    ) : (
                                      item.audioSources && item.audioSources.length > 0
                                        ? item.audioSources.join(', ')
                                        : item.audio
                                        ? 'Audio'
                                        : 'No audio'
                                    )}
                                  </div>
                                </div>

                                {/* Video Type */}
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                  <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Video Type
                                  </div>
                                  <div className="text-xs text-gray-800 dark:text-gray-200">
                                    {editingItemId === item.id ? (
                                      <Select
                                        value={editingData.videoType || item.videoType}
                                        onValueChange={(value) => updateEditingData('videoType', value)}
                                      >
                                        <SelectTrigger className="text-xs h-6">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Loop">Loop</SelectItem>
                                          <SelectItem value="One Play">One Play</SelectItem>
                                          <SelectItem value="Playlist">Playlist</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      item.videoType
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* No script - use 3-column grid layout for all details */
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            {/* Giant Screen */}
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-1 tracking-wide">
                                Giant Screen
                              </div>
                              <div className="text-xs text-purple-800 dark:text-purple-200">
                                {editingItemId === item.id ? (
                                  <Input
                                    value={editingData.giantScreen || ''}
                                    onChange={(e) => updateEditingData('giantScreen', e.target.value)}
                                    placeholder="Screen content"
                                    className="text-xs h-7"
                                  />
                                ) : (
                                  item.giantScreen || 'Competition Logo'
                                )}
                              </div>
                            </div>

                            {/* Pitch LED */}
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1 tracking-wide">
                                Pitch LED
                              </div>
                              <div className="text-xs text-indigo-800 dark:text-indigo-200">
                                {editingItemId === item.id ? (
                                  <Input
                                    value={editingData.pitchLed ?? item.pitchLed ?? ''}
                                    onChange={(e) =>
                                      updateEditingData('pitchLed', e.target.value)
                                    }
                                    placeholder="Perimeter LED"
                                    className="text-xs h-7"
                                  />
                                ) : (
                                  item.pitchLed || 'Name of Competition'
                                )}
                              </div>
                            </div>

                            {/* Ring LED */}
                            <div className="bg-sky-100 dark:bg-sky-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-1 tracking-wide">
                                Ring LED
                              </div>
                              <div className="text-xs text-sky-800 dark:text-sky-200">
                                {editingItemId === item.id ? (
                                  <Input
                                    value={editingData.ledRing ?? item.ledRing ?? ''}
                                    onChange={(e) =>
                                      updateEditingData('ledRing', e.target.value)
                                    }
                                    placeholder="Ring content"
                                    className="text-xs h-7"
                                  />
                                ) : (
                                  item.ledRing || 'Name of Competition'
                                )}
                              </div>
                            </div>

                            {/* Graphics Produced */}
                            <div className="bg-pink-100 dark:bg-pink-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase mb-1 tracking-wide">
                                Graphics Produced
                              </div>
                              <div className="text-xs text-pink-800 dark:text-pink-200">
                                {editingItemId === item.id ? (
                                  <Input
                                    value={editingData.graphicsProduced ?? item.graphicsProduced ?? ''}
                                    onChange={(e) =>
                                      updateEditingData('graphicsProduced', e.target.value)
                                    }
                                    placeholder="Graphics"
                                    className="text-xs h-7"
                                  />
                                ) : (
                                  item.graphicsProduced || '—'
                                )}
                              </div>
                            </div>

                            {/* Lights */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase mb-1 tracking-wide">
                                Lights
                              </div>
                              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                                {editingItemId === item.id ? (
                                  <Input
                                    value={editingData.lights ?? item.lights ?? ''}
                                    onChange={(e) =>
                                      updateEditingData('lights', e.target.value)
                                    }
                                    placeholder="Lighting"
                                    className="text-xs h-7"
                                  />
                                ) : (
                                  item.lights || 'Normal Lights'
                                )}
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 tracking-wide">
                                Duration
                              </div>
                              <div className="text-xs text-blue-800 dark:text-blue-200">
                                {editingItemId === item.id ? (
                                  <Input
                                    value={editingData.duration || ''}
                                    onChange={(e) => updateEditingData('duration', e.target.value)}
                                    placeholder="Duration"
                                    className="text-xs h-7"
                                  />
                                ) : (
                                  item.duration || '1 min'
                                )}
                              </div>
                            </div>

                            {/* Responsible */}
                            <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-1 tracking-wide">
                                Responsible
                              </div>
                              <div className="text-xs text-green-800 dark:text-green-200">
                                {editingItemId === item.id ? (
                                  <Input
                                    value={editingData.responsible || ''}
                                    onChange={(e) => updateEditingData('responsible', e.target.value)}
                                    placeholder="Who"
                                    className="text-xs h-7"
                                  />
                                ) : (
                                  item.responsible || 'Operator'
                                )}
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-1 tracking-wide">
                                Notes
                              </div>
                              <div className="text-xs text-purple-800 dark:text-purple-200">
                                {editingItemId === item.id ? (
                                  <Input
                                    value={editingData.notes || ''}
                                    onChange={(e) => updateEditingData('notes', e.target.value)}
                                    placeholder="Notes"
                                    className="text-xs h-7"
                                  />
                                ) : (
                                  item.notes || '—'
                                )}
                              </div>
                            </div>

                            {/* Audio */}
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-1 tracking-wide">
                                Audio
                              </div>
                              <div className="text-xs text-orange-800 dark:text-orange-200">
                                {editingItemId === item.id ? (
                                  <div className="space-y-0.5">
                                    {['Audio Only', 'MC Audio', 'DJ', 'Microphone', 'Video Audio'].map((source) => {
                                      const current = (editingData.audioSources ??
                                        item.audioSources ??
                                        []) as string[]
                                      const checked = current.includes(source)
                                      return (
                                        <label
                                          key={source}
                                          className="flex items-center space-x-1 text-[10px]"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => {
                                              const nextSources = e.target.checked
                                                ? [...current, source]
                                                : current.filter(s => s !== source)
                                              updateEditingData('audioSources', nextSources)
                                              updateEditingData('audio', nextSources.length > 0)
                                              updateEditingData(
                                                'audioOption',
                                                nextSources.length > 0
                                                  ? nextSources.join(', ')
                                                  : 'No audio'
                                              )
                                            }}
                                            className="w-3 h-3"
                                          />
                                          <span>{source}</span>
                                        </label>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  (item.audioSources && item.audioSources.length > 0
                                    ? item.audioSources.join(', ')
                                    : item.audioOption || (item.audio ? 'Audio' : 'No audio'))
                                )}
                              </div>
                            </div>

                            {/* Video Type */}
                            <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg">
                              <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1 tracking-wide">
                                Video Type
                              </div>
                              <div className="text-xs text-gray-800 dark:text-gray-200">
                                {editingItemId === item.id ? (
                                  <Select
                                    value={editingData.videoType || item.videoType}
                                    onValueChange={(value) => updateEditingData('videoType', value)}
                                  >
                                    <SelectTrigger className="text-xs h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Loop">Loop</SelectItem>
                                      <SelectItem value="One Play">One Play</SelectItem>
                                      <SelectItem value="Playlist">Playlist</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  item.videoType
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    })}
    </div>
  )
}
