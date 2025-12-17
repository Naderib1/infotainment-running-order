import { useState } from 'react'
import { ChevronLeft, Calendar, CalendarOff, Smile, FolderOpen, Info, Phone } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { FanZoneSchedule } from '../data/fanZoneSchedule'
import { FanZoneRunningOrder } from './FanZoneRunningOrder'
import { FanZoneNonMatchdays } from './FanZoneNonMatchdays'
import { MascotSchedule } from './MascotSchedule'
import { useNonMatchdaySchedule } from '../hooks/useNonMatchdaySchedule'

interface FanZoneHubProps {
  matchdaySchedule?: FanZoneSchedule
  onBack: () => void
  isAdmin?: boolean
  userEmail?: string
}

type FanZoneView = 'hub' | 'matchdays' | 'non-matchdays' | 'mascot'

export function FanZoneHub({ matchdaySchedule, onBack, isAdmin = false, userEmail }: FanZoneHubProps) {
  const { schedule: nonMatchdaySchedule } = useNonMatchdaySchedule()
  const [currentView, setCurrentView] = useState<FanZoneView>('hub')

  // Sub-views
  if (currentView === 'matchdays') {
    return (
      <FanZoneRunningOrder 
        schedule={matchdaySchedule} 
        onBack={() => setCurrentView('hub')} 
      />
    )
  }

  if (currentView === 'non-matchdays') {
    return (
      <FanZoneNonMatchdays 
        schedule={nonMatchdaySchedule || undefined} 
        onBack={() => setCurrentView('hub')} 
      />
    )
  }

  if (currentView === 'mascot') {
    return (
      <MascotSchedule 
        onBack={() => setCurrentView('hub')} 
        isAdmin={isAdmin}
        userEmail={userEmail}
      />
    )
  }

  // Hub view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50 print:hidden">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Platform
        </Button>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Fan Zones
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            AFCON 2025 Morocco - Fan Zone Running Orders & Schedules
          </p>
        </div>

        {/* Usage Instructions */}
        <Card className="mb-8 border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg mb-2">
                  How to Use This Running Order
                </h3>
                <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                  <li>• This running order is designed for <strong>1 game</strong>, but it repeats if there are multiple games during the same day.</li>
                  <li>• When the gap between games is <strong>smaller than 2 hours</strong>, you should squeeze the material of the running order accordingly.</li>
                  <li>• All timings are relative to Kick-Off (KO). Negative times are before KO, positive times are after.</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-blue-200 dark:border-blue-700 pt-4 mt-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-amber-600 dark:text-amber-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Important:</strong> All materials are owned by <strong>CAF</strong> only. CAF reserves the right to request removal of any material at any point.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-green-800 dark:text-green-200 text-sm">
                  For any questions, please contact the <strong>CAF Infotainment Team</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matchdays */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-0 overflow-hidden"
            onClick={() => setCurrentView('matchdays')}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <Calendar className="h-12 w-12 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Matchdays</h2>
                <p className="text-green-100 text-sm">
                  Running order for Fan Zones during match days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Non-Matchdays */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-0 overflow-hidden"
            onClick={() => setCurrentView('non-matchdays')}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                <CalendarOff className="h-12 w-12 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Non-Matchdays</h2>
                <p className="text-blue-100 text-sm">
                  Running order for Fan Zones on non-match days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mascot Schedule */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-0 overflow-hidden"
            onClick={() => setCurrentView('mascot')}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                <Smile className="h-12 w-12 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Mascot Schedule</h2>
                <p className="text-orange-100 text-sm">
                  View mascot appearances by date and city
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Material */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-0 overflow-hidden"
            onClick={() => window.open('https://drive.google.com/drive/folders/1D2sqkAKSxreKTpLdEPF4BwEusyJDa9Hv', '_blank')}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <FolderOpen className="h-12 w-12 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Material</h2>
                <p className="text-purple-100 text-sm">
                  Access CAF Fan Zone materials (opens in new tab)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>AFCON 2025 Morocco • CAF Infotainment</p>
        </div>
      </div>
    </div>
  )
}
