import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RunningOrderItem } from '@/types'
import { Edit2, Trash2, Check, X } from 'lucide-react'

interface RunningOrderTableProps {
  items: RunningOrderItem[]
  onUpdateItem: (id: string, updates: Partial<RunningOrderItem>) => void
  onDeleteItem: (id: string) => void
}

export function RunningOrderTable({
  items,
  onUpdateItem,
  onDeleteItem
}: RunningOrderTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<RunningOrderItem>>({})

  const activeItems = items.filter(item => item.active !== false)

  const sortedItems = [...activeItems].sort((a, b) => {
    // Custom sorting for relative times
    const parseTime = (timeStr: string) => {
      if (timeStr.startsWith('-')) {
        // Before kick off
        const cleanTime = timeStr.replace(/^-/, '')
        const [hours, minutes] = cleanTime.split(':').map(Number)
        return -(hours * 60 + minutes)
      } else if (timeStr.startsWith('+')) {
        // After kick off
        const cleanTime = timeStr.replace(/^\+/, '')
        const [hours, minutes] = cleanTime.split(':').map(Number)
        return 1000 + (hours * 60 + minutes)
      } else if (timeStr.startsWith('HT+')) {
        // After half time
        const cleanTime = timeStr.replace(/^HT\+/, '')
        const [hours, minutes] = cleanTime.split(':').map(Number)
        return 2000 + (hours * 60 + minutes)
      } else if (timeStr.startsWith('FT+')) {
        // After full time
        const cleanTime = timeStr.replace(/^FT\+/, '')
        const [hours, minutes] = cleanTime.split(':').map(Number)
        return 3000 + (hours * 60 + minutes)
      } else {
        // Absolute time
        const [hours, minutes] = timeStr.split(':').map(Number)
        return 4000 + (hours * 60 + minutes)
      }
    }
    
    return parseTime(a.time) - parseTime(b.time)
  })

  const startEdit = (item: RunningOrderItem) => {
    setEditingId(item.id)
    setEditingData(item)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData({})
  }

  const saveEdit = () => {
    if (editingId && editingData) {
      onUpdateItem(editingId, editingData)
      setEditingId(null)
      setEditingData({})
    }
  }

  const updateEditingData = (field: string, value: any) => {
    setEditingData(prev => ({ ...prev, [field]: value }))
  }

  if (activeItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No items added yet. Add your first running order item above.</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24 sticky left-0 bg-background z-10">Time</TableHead>
            <TableHead className="min-w-[180px]">Title</TableHead>
            <TableHead className="min-w-[80px]">Duration</TableHead>
            <TableHead className="min-w-[150px]">Responsible</TableHead>
            <TableHead className="min-w-[120px]">Giant Screen</TableHead>
            <TableHead className="min-w-[120px]">Pitch LED</TableHead>
            <TableHead className="min-w-[120px]">Ring LED</TableHead>
            <TableHead className="min-w-[120px]">Graphics Produced</TableHead>
            <TableHead className="min-w-[100px]">Lights</TableHead>
            <TableHead className="min-w-[150px]">Notes</TableHead>
            <TableHead className="min-w-[80px]">Audio</TableHead>
            <TableHead className="min-w-[80px]">Video</TableHead>
            <TableHead className="w-24 sticky right-0 bg-background z-10">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow key={item.id} className="hover:bg-white/5">
              {/* Time */}
              <TableCell className="font-mono sticky left-0 bg-background z-10">
                {editingId === item.id ? (
                  <Input
                    value={editingData.time || ''}
                    onChange={(e) => updateEditingData('time', e.target.value)}
                    className="w-24 text-xs"
                    placeholder="-01:00:00"
                  />
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium ${
                    item.time.startsWith('-') 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : item.time.startsWith('+')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : item.time.startsWith('HT+')
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : item.time.startsWith('FT+')
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {item.time}
                  </span>
                )}
              </TableCell>
              {/* Title */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.title || ''}
                    onChange={(e) => updateEditingData('title', e.target.value)}
                    className="min-w-[150px] text-xs"
                  />
                ) : (
                  <span className="text-sm font-medium">{item.title || '-'}</span>
                )}
              </TableCell>
              {/* Duration */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.duration || ''}
                    onChange={(e) => updateEditingData('duration', e.target.value)}
                    placeholder="e.g., 15 min"
                    className="w-20 text-xs"
                  />
                ) : (
                  <span className="text-sm">{item.duration || '-'}</span>
                )}
              </TableCell>
              {/* Responsible */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.responsible || ''}
                    onChange={(e) => updateEditingData('responsible', e.target.value)}
                    className="min-w-[120px] text-xs"
                  />
                ) : (
                  <span className="text-sm">{item.responsible || '-'}</span>
                )}
              </TableCell>
              {/* Giant Screen */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.giantScreen || ''}
                    onChange={(e) => updateEditingData('giantScreen', e.target.value)}
                    className="min-w-[100px] text-xs"
                    placeholder="Screen content"
                  />
                ) : (
                  <span className="text-sm text-cyan-700 dark:text-cyan-300">{item.giantScreen || '-'}</span>
                )}
              </TableCell>
              {/* Pitch LED */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.pitchLed || ''}
                    onChange={(e) => updateEditingData('pitchLed', e.target.value)}
                    className="min-w-[100px] text-xs"
                    placeholder="Pitch LED"
                  />
                ) : (
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">{item.pitchLed || 'Name of Competition'}</span>
                )}
              </TableCell>
              {/* Ring LED */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.ledRing || ''}
                    onChange={(e) => updateEditingData('ledRing', e.target.value)}
                    className="min-w-[100px] text-xs"
                    placeholder="Ring LED"
                  />
                ) : (
                  <span className="text-sm text-sky-700 dark:text-sky-300">{item.ledRing || 'Name of Competition'}</span>
                )}
              </TableCell>
              {/* Graphics Produced */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.graphicsProduced || ''}
                    onChange={(e) => updateEditingData('graphicsProduced', e.target.value)}
                    className="min-w-[100px] text-xs"
                    placeholder="Graphics"
                  />
                ) : (
                  <span className="text-sm text-pink-700 dark:text-pink-300">{item.graphicsProduced || '-'}</span>
                )}
              </TableCell>
              {/* Lights */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.lights || ''}
                    onChange={(e) => updateEditingData('lights', e.target.value)}
                    className="min-w-[80px] text-xs"
                    placeholder="Lights"
                  />
                ) : (
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">{item.lights || 'Normal'}</span>
                )}
              </TableCell>
              {/* Notes */}
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editingData.notes || ''}
                    onChange={(e) => updateEditingData('notes', e.target.value)}
                    className="min-w-[120px] text-xs"
                    placeholder="Notes"
                  />
                ) : (
                  <span className="text-sm text-purple-700 dark:text-purple-300">{item.notes || '-'}</span>
                )}
              </TableCell>
              {/* Audio */}
              <TableCell>
                {editingId === item.id ? (
                  <select
                    value={editingData.audio ? 'yes' : 'no'}
                    onChange={(e) => updateEditingData('audio', e.target.value === 'yes')}
                    className="h-8 px-2 rounded border border-input bg-background text-xs"
                  >
                    <option value="yes">With audio</option>
                    <option value="no">No audio</option>
                  </select>
                ) : (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.audio
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {item.audio ? 'With audio' : 'No audio'}
                </span>
                )}
              </TableCell>
              {/* Video */}
              <TableCell>
                {editingId === item.id ? (
                  <select
                    value={editingData.videoType || 'Loop'}
                    onChange={(e) => updateEditingData('videoType', e.target.value)}
                    className="h-8 px-2 rounded border border-input bg-background text-xs"
                  >
                    <option value="Loop">Loop</option>
                    <option value="One Play">One Play</option>
                    <option value="Playlist">Playlist</option>
                  </select>
                ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {item.videoType}
                </span>
                )}
              </TableCell>
              {/* Actions */}
              <TableCell className="sticky right-0 bg-background z-10">
                <div className="flex items-center gap-1">
                  {editingId === item.id ? (
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
                        onClick={() => onDeleteItem(item.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
