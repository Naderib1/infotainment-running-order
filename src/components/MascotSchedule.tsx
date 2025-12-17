import { useState, useMemo } from 'react'
import { ChevronLeft, Calendar, MapPin, Check, FileText, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { downloadFile } from '../lib/utils'

interface MascotScheduleProps {
  onBack: () => void
}

// Cities for mascot appearances
const CITIES = [
  { id: 'rabat1', name: 'Rabat 1', color: 'from-red-500 to-rose-500' },
  { id: 'rabat2', name: 'Rabat 2', color: 'from-red-400 to-rose-400' },
  { id: 'casablanca1', name: 'Casablanca 1', color: 'from-blue-500 to-indigo-500' },
  { id: 'casablanca2', name: 'Casablanca 2', color: 'from-blue-400 to-indigo-400' },
  { id: 'marrakech', name: 'Marrakech', color: 'from-orange-500 to-amber-500' },
  { id: 'tangier', name: 'Tangier', color: 'from-teal-500 to-cyan-500' },
  { id: 'fez', name: 'Fez', color: 'from-purple-500 to-violet-500' },
  { id: 'agadir', name: 'Agadir', color: 'from-green-500 to-emerald-500' },
]

// Generate dates from Dec 20, 2024 to Jan 20, 2025
const generateDates = (): Date[] => {
  const dates: Date[] = []
  const startDate = new Date(2024, 11, 20) // Dec 20, 2024
  const endDate = new Date(2025, 0, 20) // Jan 20, 2025
  
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

const DATES = generateDates()

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  })
}

const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
}

export function MascotSchedule({ onBack }: MascotScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [scheduleData, setScheduleData] = useState<Record<string, string[]>>({})

  // Toggle city selection for current date
  const toggleCity = (cityId: string) => {
    if (!selectedDate) return
    
    const dateKey = selectedDate.toISOString().split('T')[0]
    const currentCities = scheduleData[dateKey] || []
    
    if (currentCities.includes(cityId)) {
      setScheduleData({
        ...scheduleData,
        [dateKey]: currentCities.filter(c => c !== cityId)
      })
    } else {
      setScheduleData({
        ...scheduleData,
        [dateKey]: [...currentCities, cityId]
      })
    }
  }

  // Get cities for a specific date
  const getCitiesForDate = (date: Date): string[] => {
    const dateKey = date.toISOString().split('T')[0]
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
    
    DATES.forEach(date => {
      const cities = getCitiesForDate(date)
      if (cities.length > 0) {
        content += `${formatDateFull(date)}:\n`
        cities.forEach(cityId => {
          const city = CITIES.find(c => c.id === cityId)
          if (city) {
            content += `  - ${city.name}\n`
          }
        })
        content += '\n'
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

      {/* Export Button */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg"
        >
          <Download className="h-4 w-4" />
          Export Schedule
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
                    const hasCities = getCitiesForDate(date).length > 0
                    
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          p-2 rounded-lg text-center transition-all
                          ${isSelected 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105' 
                            : hasCities
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
                        {hasCities && !isSelected && (
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
                    Select Cities
                  </h2>
                </div>

                {selectedDate ? (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      {formatDateFull(selectedDate)}
                    </p>
                    <div className="space-y-2">
                      {CITIES.map((city) => {
                        const isSelected = getCitiesForDate(selectedDate).includes(city.id)
                        
                        return (
                          <button
                            key={city.id}
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
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a date to choose cities</p>
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

            {totalAppearances > 0 ? (
              <div className="space-y-3">
                {DATES.filter(date => getCitiesForDate(date).length > 0).map((date) => {
                  const cities = getCitiesForDate(date)
                  
                  return (
                    <div 
                      key={date.toISOString()}
                      className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <div className="min-w-[120px] font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(date)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cities.map(cityId => {
                          const city = CITIES.find(c => c.id === cityId)
                          if (!city) return null
                          
                          return (
                            <span 
                              key={cityId}
                              className={`px-3 py-1 rounded-full text-sm text-white bg-gradient-to-r ${city.color}`}
                            >
                              {city.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p>No mascot appearances scheduled yet.</p>
                <p className="text-sm mt-1">Select a date and choose cities to schedule appearances.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
