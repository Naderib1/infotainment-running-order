import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RunningOrderItem, RunningOrderCategory } from '@/types'

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddItem: (item: Omit<RunningOrderItem, 'id'>) => void
  categories: RunningOrderCategory[]
  initialCategoryId?: string
}

export function AddItemDialog({
  open,
  onOpenChange,
  onAddItem,
  categories,
  initialCategoryId
}: AddItemDialogProps) {
  const resolveInitialCategory = () => {
    const fallback = categories.length > 0 ? categories[0].id : ''
    if (initialCategoryId && categories.some(c => c.id === initialCategoryId)) {
      return initialCategoryId
    }
    return fallback
  }

  const [formData, setFormData] = useState({
    timeType: 'before',
    timeValue: '',
    title: '',
    description1: '',
    materialType: 'Video' as RunningOrderItem['materialType'],
    audio: false,
    audioSources: [] as string[],
    loop: false,
    script1: '',
    giantScreen: '',
    pitchLed: '',
    ledRing: '',
    graphicsProduced: '',
    lights: '',
    duration: '',
    responsible: '',
    notes: '',
    audioOption: 'No audio',
    videoType: 'Loop',
    active: true,
    category: resolveInitialCategory()
  })

  const resetForm = () => {
    setFormData({
      timeType: 'before',
      timeValue: '',
      title: '',
      description1: '',
      materialType: 'Video',
      audio: false,
      audioSources: [] as string[],
      loop: false,
      script1: '',
      giantScreen: '',
      pitchLed: '',
      ledRing: '',
      graphicsProduced: '',
      lights: '',
      duration: '',
      responsible: '',
      notes: '',
      audioOption: 'No audio',
      videoType: 'Loop',
      active: true,
      category: resolveInitialCategory()
    })
  }

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        category: resolveInitialCategory()
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCategoryId, categories.length])

  const handleSubmit = () => {
    if (formData.timeValue && formData.title) {
      // Format the time based on type
      let formattedTime = ''
      if (formData.timeType === 'before') {
        formattedTime = `-${formData.timeValue}`
      } else if (formData.timeType === 'after') {
        formattedTime = `+${formData.timeValue}`
      } else if (formData.timeType === 'halftime') {
        formattedTime = `HT+${formData.timeValue}`
      } else if (formData.timeType === 'fulltime') {
        formattedTime = `FT+${formData.timeValue}`
      }
      
      const { timeType, timeValue, ...rest } = formData

      const audioSources = rest.audioSources || []

      onAddItem({
        ...rest,
        time: formattedTime,
        audioSources,
        audio: audioSources.length > 0,
        audioOption:
          audioSources.length > 0 ? audioSources.join(', ') : 'No audio',
        active: rest.active
      } as Omit<RunningOrderItem, 'id'>)
      resetForm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Running Order Item</DialogTitle>
          <DialogDescription>
            Create a new item for your running order template. Use tokens like [TeamA-L1]/[TeamA-L2], [Stadium-L1]/[Stadium-L2], [City-L1]/[City-L2], and [MatchTime] inside the script and notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={formData.timeType}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeType: e.target.value }))}
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="before">Before Kick off</option>
                    <option value="after">After Kick Off</option>
                    <option value="halftime">of Half Time</option>
                    <option value="fulltime">of Full Time</option>
                  </select>
                  <Input
                    type="text"
                    pattern="[0-9]{2}:[0-9]{2}"
                    placeholder="HH:MM"
                    value={formData.timeValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeValue: e.target.value }))}
                    className="flex-1"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.timeType === 'before' && formData.timeValue && (
                    <span className="text-red-600 font-mono">-{formData.timeValue}</span>
                  )}
                  {formData.timeType === 'after' && formData.timeValue && (
                    <span className="text-green-600 font-mono">+{formData.timeValue}</span>
                  )}
                  {formData.timeType === 'halftime' && formData.timeValue && (
                    <span className="text-orange-600 font-mono">HT+{formData.timeValue}</span>
                  )}
                  {formData.timeType === 'fulltime' && formData.timeValue && (
                    <span className="text-purple-600 font-mono">FT+{formData.timeValue}</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <div><strong>Before Kick off:</strong> -02:00 (2 minutes before kick off)</div>
                  <div><strong>After Kick Off:</strong> +15:00 (15 minutes after kick off)</div>
                  <div><strong>of Half Time:</strong> HT+05:00 (5 minutes after half time)</div>
                  <div><strong>of Full Time:</strong> FT+10:00 (10 minutes after full time)</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Team Arrival at [Stadium]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description1">Description (Language 1)</Label>
              <textarea
                id="description1"
                className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background resize-none"
                value={formData.description1}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description1: e.target.value }))
                }
                placeholder="Short description for this element."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 15 mins"
              />
            </div>

            <div className="space-y-2">
              <Label>Responsible Person(s)</Label>
              <div className="space-y-2">
                {[
                  'Infotainment Operator',
                  'GC',
                  'Announcer',
                  'Opening Ceremony Company',
                  'Marketing Officer',
                  'CAF Staff',
                  'PMC',
                  'Floor Manager',
                  'Influencers',
                  'Legends',
                  'Mascot',
                  'Others'
                ].map((person) => (
                  <label key={person} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.responsible.includes(person)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            responsible: prev.responsible ? `${prev.responsible}, ${person}` : person
                          }))
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            responsible: prev.responsible
                              .split(', ')
                              .filter(p => p !== person)
                              .join(', ')
                          }))
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{person}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Material Type</Label>
              <select
                value={formData.materialType}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    materialType: e.target.value as RunningOrderItem['materialType']
                  }))
                }
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="Video">Video</option>
                <option value="Audio">Audio</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Audio Sources</Label>
              <div className="space-y-1">
                {['Audio Only', 'MC Audio', 'DJ', 'Microphone', 'Video Audio'].map((source) => {
                  const checked = formData.audioSources.includes(source)
                  return (
                    <label key={source} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setFormData(prev => {
                            const nextSources = e.target.checked
                              ? [...prev.audioSources, source]
                              : prev.audioSources.filter(s => s !== source)
                            return {
                              ...prev,
                              audioSources: nextSources,
                              audio: nextSources.length > 0,
                              audioOption:
                                nextSources.length > 0
                                  ? nextSources.join(', ')
                                  : 'No audio'
                            }
                          })
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{source}</span>
                    </label>
                  )
                })}
                <p className="text-xs text-muted-foreground">
                  You can tick more than one (for example: DJ + Video Audio).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Video Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="videoType"
                    value="Loop"
                    checked={formData.videoType === 'Loop'}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        videoType: e.target.value,
                        loop: true
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span>Loop</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="videoType"
                    value="One Play"
                    checked={formData.videoType === 'One Play'}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        videoType: e.target.value,
                        loop: false
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span>One Play</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="videoType"
                    value="Playlist"
                    checked={formData.videoType === 'Playlist'}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        videoType: e.target.value,
                        loop: false
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span>Playlist</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Active</Label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      active: e.target.checked
                    }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Include this item in exports</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-sm text-red-600">
                  Please create categories first before adding items
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="script">Script (mixed L1 / L2)</Label>
              <textarea
                id="script"
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background resize-none"
                value={formData.script1}
                onChange={(e) => setFormData(prev => ({ ...prev, script1: e.target.value }))}
                placeholder="Use English (L1) and Arabic (L2) in one script. Tokens: [TeamA-L1], [TeamA-L2], [Stadium-L1], [Stadium-L2], [MatchTime]..."
              />
            </div>

            <div className="space-y-2 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-md p-3">
              <div className="font-semibold mb-1">Available tokens</div>
              <p className="mb-1">
                L1 = English, L2 = Arabic. For example, [TeamA-L1] prints the English team name and [TeamA-L2] prints the Arabic name.
              </p>
              <div className="grid grid-cols-2 gap-1">
                <span>[Competition-L1]</span>
                <span>[Competition-L2]</span>
                <span>[Stadium-L1]</span>
                <span>[Stadium-L2]</span>
                <span>[City-L1]</span>
                <span>[City-L2]</span>
                <span>[TeamA-L1]</span>
                <span>[TeamA-L2]</span>
                <span>[TeamB-L1]</span>
                <span>[TeamB-L2]</span>
                <span>[MatchTime]</span>
              </div>
              <div className="mt-2">
                Legacy (L1 only): [Competition], [Stadium], [City], [TeamA], [TeamB]
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="giantScreen">Giant Screen Content</Label>
              <textarea
                id="giantScreen"
                className="w-full min-h-[60px] p-3 rounded-md border border-input bg-background resize-none"
                value={formData.giantScreen}
                onChange={(e) => setFormData(prev => ({ ...prev, giantScreen: e.target.value }))}
                placeholder="Main stadium screen content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitchLed">Pitch LED Content</Label>
              <textarea
                id="pitchLed"
                className="w-full min-h-[60px] p-3 rounded-md border border-input bg-background resize-none"
                value={formData.pitchLed}
                onChange={(e) => setFormData(prev => ({ ...prev, pitchLed: e.target.value }))}
                placeholder="Perimeter Pitch LED content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ledRing">Ring LED Content</Label>
              <textarea
                id="ledRing"
                className="w-full min-h-[60px] p-3 rounded-md border border-input bg-background resize-none"
                value={formData.ledRing}
                onChange={(e) => setFormData(prev => ({ ...prev, ledRing: e.target.value }))}
                placeholder="Upper Ring LED / ribbon content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graphicsProduced">Graphics Produced</Label>
              <textarea
                id="graphicsProduced"
                className="w-full min-h-[60px] p-3 rounded-md border border-input bg-background resize-none"
                value={formData.graphicsProduced}
                onChange={(e) => setFormData(prev => ({ ...prev, graphicsProduced: e.target.value }))}
                placeholder="Graphics produced for this item"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lights">Lights</Label>
              <textarea
                id="lights"
                className="w-full min-h-[60px] p-3 rounded-md border border-input bg-background resize-none"
                value={formData.lights}
                onChange={(e) => setFormData(prev => ({ ...prev, lights: e.target.value }))}
                placeholder="Lighting cues for this element"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background resize-none"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Coordinate with [Stadium] security team..."
              />
            </div>

          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.timeValue || !formData.title || categories.length === 0}
          >
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
