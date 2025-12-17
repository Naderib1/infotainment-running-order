import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, Calendar, MapPin, Check, FileText, Download, Save, Clock } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { downloadFile } from '../lib/utils'
import { useMascotSchedule, MascotEntry } from '../hooks/useMascotSchedule'

interface MascotScheduleProps {
  onBack: () => void
  isAdmin?: boolean
  userEmail?: string
}

// Cities for mascot appearances
const CITIES = [
  { id: 'rabat1', name: 'Rabat 1 (OLM)', color: 'from-red-500 to-rose-500' },
  { id: 'rabat2', name: 'Rabat 2 (Salé)', color: 'from-red-400 to-rose-400' },
  { id: 'casablanca1', name: 'Casablanca 1 (Anfa Park)', color: 'from-blue-500 to-indigo-500' },
  { id: 'casablanca2', name: 'Casablanca 2 (Espace Toro)', color: 'from-blue-400 to-indigo-400' },
  { id: 'marrakech', name: 'Marrakech', color: 'from-orange-500 to-amber-500' },
  { id: 'tangier', name: 'Tangier', color: 'from-teal-500 to-cyan-500' },
  { id: 'fez', name: 'Fez', color: 'from-purple-500 to-violet-500' },
  { id: 'agadir', name: 'Agadir', color: 'from-green-500 to-emerald-500' },
  { id: 'none', name: 'No Appearance', color: 'from-slate-400 to-slate-500' },
]

// Generate dates from Dec 20, 2025 to Jan 18, 2026 (Final day)
const generateDates = (): Date[] => {
  const dates: Date[] = []
  const startDate = new Date(2025, 11, 20) // Dec 20, 2025
  const endDate = new Date(2026, 0, 18) // Jan 18, 2026 (Final)
  
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

const DATES = generateDates()

// Format date for display
const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
}

export function MascotSchedule({ onBack, isAdmin = false, userEmail }: MascotScheduleProps) {
  const { data: savedData, loading, saving, saveSchedule } = useMascotSchedule()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [scheduleData, setScheduleData] = useState<Record<string, MascotEntry[]>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Load saved data when it arrives
  useEffect(() => {
    if (savedData?.schedule) {
      setScheduleData(savedData.schedule)
    }
  }, [savedData])

  // Helper to get date key in YYYY-MM-DD format (local time)
  const getDateKey = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Add or remove entry for current date (admin only)
  const toggleCity = (cityId: string) => {
    if (!selectedDate || !isAdmin) return
    
    const dateKey = getDateKey(selectedDate)
    const currentEntries = scheduleData[dateKey] || []
    const existingIndex = currentEntries.findIndex(e => e.cityId === cityId)
    
    if (existingIndex >= 0) {
      setScheduleData({
        ...scheduleData,
        [dateKey]: currentEntries.filter(e => e.cityId !== cityId)
      })
    } else {
      setScheduleData({
        ...scheduleData,
        [dateKey]: [...currentEntries, { cityId, time: '19:00', note: '' }]
      })
    }
    setHasChanges(true)
  }

  // Update entry time
  const updateEntryTime = (cityId: string, time: string) => {
    if (!selectedDate || !isAdmin) return
    const dateKey = getDateKey(selectedDate)
    const currentEntries = scheduleData[dateKey] || []
    setScheduleData({
      ...scheduleData,
      [dateKey]: currentEntries.map(e => e.cityId === cityId ? { ...e, time } : e)
    })
    setHasChanges(true)
  }

  // Update entry note
  const updateEntryNote = (cityId: string, note: string) => {
    if (!selectedDate || !isAdmin) return
    const dateKey = getDateKey(selectedDate)
    const currentEntries = scheduleData[dateKey] || []
    setScheduleData({
      ...scheduleData,
      [dateKey]: currentEntries.map(e => e.cityId === cityId ? { ...e, note } : e)
    })
    setHasChanges(true)
  }

  // Save schedule (admin only)
  const handleSave = async () => {
    if (!isAdmin) return
    const success = await saveSchedule({ schedule: scheduleData }, userEmail)
    if (success) {
      setHasChanges(false)
    }
  }

  // Get entries for a specific date (use local date to avoid timezone issues)
  const getEntriesForDate = (date: Date): MascotEntry[] => {
    const dateKey = getDateKey(date)
    return scheduleData[dateKey] || []
  }

  // Count total scheduled appearances
  const totalAppearances = useMemo(() => {
    return Object.values(scheduleData).reduce((sum, cities) => sum + cities.length, 0)
  }, [scheduleData])

  // Export schedule
  const handleExport = () => {
    let content = 'AFCON 2025 - Mascot Schedule\n'
    content += '================================\n\n'
    content += 'Date | Day | Time | Fan Zone | Note\n'
    content += '-------------------------------------------\n\n'
    
    DATES.forEach(date => {
      const entries = getEntriesForDate(date)
      if (entries.length > 0) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
        const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
        entries.forEach(entry => {
          const city = CITIES.find(c => c.id === entry.cityId)
          if (city) {
            content += `${dateStr} | ${dayName} | ${entry.time} | ${city.name} | ${entry.note}\n`
          }
        })
      }
    })
    
    if (totalAppearances === 0) {
      content += 'No mascot appearances scheduled yet.\n'
    }
    
    downloadFile(content, 'mascot-schedule.txt', 'text/plain')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-orange-900 dark:to-amber-900">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50 print:hidden">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Fan Zones
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="fixed top-4 right-4 z-50 print:hidden flex gap-2">
        {isAdmin && (
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Mascot Schedule
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            AFCON 2025 Morocco • December 20 - January 20
          </p>
          {totalAppearances > 0 && (
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              {totalAppearances} appearance{totalAppearances !== 1 ? 's' : ''} scheduled
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Selector */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Select Date
                  </h2>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {DATES.map((date) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString()
                    const hasEntries = getEntriesForDate(date).length > 0
                    
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          p-2 rounded-lg text-center transition-all
                          ${isSelected 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105' 
                            : hasEntries
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 hover:bg-orange-200'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }
                        `}
                      >
                        <div className="text-xs font-medium">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {date.getDate()}
                        </div>
                        {hasEntries && !isSelected && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto mt-1" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* City Selector */}
          <div>
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {isAdmin ? 'Select Cities' : 'Cities for Date'}
                  </h2>
                </div>

                {selectedDate ? (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      {formatDateFull(selectedDate)}
                    </p>
                    <div className="space-y-2">
                      {isAdmin ? (
                        // Admin view: show all cities as toggleable buttons
                        CITIES.map((city) => {
                          const entry = getEntriesForDate(selectedDate).find(e => e.cityId === city.id)
                          const isSelected = !!entry
                          
                          return (
                            <div key={city.id}>
                              <button
                                onClick={() => toggleCity(city.id)}
                                className={`
                                  w-full p-3 rounded-lg text-left transition-all flex items-center justify-between
                                  ${isSelected 
                                    ? `bg-gradient-to-r ${city.color} text-white shadow-md` 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  }
                                `}
                              >
                                <span className="font-medium">{city.name}</span>
                                {isSelected && <Check className="h-5 w-5" />}
                              </button>
                              {isSelected && entry && (
                                <div className="mt-2 ml-2 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <input
                                      type="text"
                                      value={entry.time}
                                      onChange={(e) => updateEntryTime(city.id, e.target.value)}
                                      placeholder="Time (e.g., 19:00 or During game)"
                                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                                    />
                                  </div>
                                  <textarea
                                    value={entry.note}
                                    onChange={(e) => updateEntryNote(city.id, e.target.value)}
                                    placeholder="Note (e.g., Match details)"
                                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                                    rows={2}
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        // User view: show only scheduled entries with details
                        getEntriesForDate(selectedDate).length > 0 ? (
                          getEntriesForDate(selectedDate).map((entry) => {
                            const city = CITIES.find(c => c.id === entry.cityId)
                            if (!city) return null
                            return (
                              <div
                                key={entry.cityId}
                                className={`w-full p-3 rounded-lg bg-gradient-to-r ${city.color} text-white shadow-md`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{city.name}</span>
                                  <span className="text-sm opacity-90">{entry.time}</span>
                                </div>
                                {entry.note && (
                                  <p className="text-sm mt-1 opacity-90">{entry.note}</p>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                            No mascot appearances scheduled for this date.
                          </p>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a date to {isAdmin ? 'choose cities' : 'view schedule'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Schedule Overview */}
        <Card className="glass-card border-0 mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Schedule Overview
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p>Loading schedule...</p>
              </div>
            ) : totalAppearances > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Day</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Time</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Fan Zone</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DATES.flatMap(date => {
                      const entries = getEntriesForDate(date)
                      if (entries.length === 0) return []
                      
                      return entries.map((entry) => {
                        const city = CITIES.find(c => c.id === entry.cityId)
                        if (!city) return null
                        
                        const isSpecial = entry.note.includes('SPECIAL') || entry.note.includes('FINAL')
                        
                        return (
                          <tr 
                            key={`${date.toISOString()}-${entry.cityId}`}
                            className={`border-b border-slate-100 dark:border-slate-800 ${isSpecial ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                          >
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                              {date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">
                              {entry.time}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium text-white bg-gradient-to-r ${city.color}`}>
                                {city.name}
                              </span>
                            </td>
                            <td className={`py-2 px-3 text-slate-600 dark:text-slate-400 ${isSpecial ? 'font-semibold text-amber-700 dark:text-amber-300' : ''}`}>
                              {entry.note}
                            </td>
                          </tr>
                        )
                      })
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p>No mascot appearances scheduled yet.</p>
                {isAdmin && <p className="text-sm mt-1">Select a date and choose cities to schedule appearances.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
