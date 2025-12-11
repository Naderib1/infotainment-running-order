import { useState, useEffect, useCallback } from 'react'
import { CompetitionSetup } from './components/CompetitionSetup'
import { RunningOrderTemplate } from './components/RunningOrderTemplate'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Competition, RunningOrderItem, AppData, MatchConfig } from './types'
import { defaultCategories, defaultRunningOrder, defaultStadiums, defaultTeams } from './data/defaultCategories'
import { ensureAppDataShape } from './lib/ensureShape'

// Path to the default template file in the public folder
// To update the template, replace the file at: public/default-template.json
const DEFAULT_TEMPLATE_URL = '/default-template.json'

const initialCompetition: Competition = {
  name1: 'TotalEnergies CAF Africa Cup of Nations, Morocco 2025',
  name2: 'كأس الأمم الإفريقية توتال إنرجيز، المغرب 2025',
  name: 'TotalEnergies CAF Africa Cup of Nations, Morocco 2025',
  startDate: new Date('2025-12-21T00:00:00Z').toISOString(),
  endDate: new Date('2026-01-18T00:00:00Z').toISOString(),
  logoDataUrl:
    'https://upload.wikimedia.org/wikipedia/en/thumb/8/85/2025_Africa_Cup_of_Nations_logo.svg/500px-2025_Africa_Cup_of_Nations_logo.svg.png',
  stadiums: defaultStadiums,
  teams: defaultTeams,
  branding: {
    logo:
      'https://upload.wikimedia.org/wikipedia/en/thumb/8/85/2025_Africa_Cup_of_Nations_logo.svg/500px-2025_Africa_Cup_of_Nations_logo.svg.png',
    primaryColor: '#8D0000',
    secondaryColor: '#B50000'
  }
}

const initialMatchConfig: MatchConfig = {
  teamAId: '',
  teamBId: '',
  stadiumId: '',
  matchTime: '',
  extraNotes: '',
  useGenericTeams: false
}

const initialAppData: AppData = {
  competition: initialCompetition,
  runningOrder: defaultRunningOrder as RunningOrderItem[],
  categories: defaultCategories,
  selectedVenue: '',
  matchConfig: initialMatchConfig,
  dataVersion: 2
}

function App() {
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 1
    try {
      const stored = window.localStorage.getItem(
        'running-order-current-step'
      )
      if (stored === '2') return 2
    } catch {
      // ignore
    }
    return 1
  })
  const [appData, setAppData] = useLocalStorage<AppData>('running-order-app', initialAppData)
  const [isLoading, setIsLoading] = useState(true)

  // Function to load template from the default template file
  const loadDefaultTemplate = useCallback(async () => {
    try {
      const response = await fetch(DEFAULT_TEMPLATE_URL)
      if (!response.ok) {
        console.warn('Default template not found, using built-in defaults')
        return null
      }
      const templateData = await response.json()
      
      // Validate the template structure
      if (!templateData.competition && !templateData.runningOrder && !templateData.categories) {
        console.warn('Invalid template structure, using built-in defaults')
        return null
      }
      
      return ensureAppDataShape({
        competition: templateData.competition || initialCompetition,
        runningOrder: templateData.runningOrder || [],
        categories: templateData.categories || [],
        selectedVenue: templateData.selectedVenue ?? '',
        matchConfig: templateData.matchConfig ?? initialMatchConfig
      })
    } catch (error) {
      console.warn('Error loading default template:', error)
      return null
    }
  }, [])

  // On first load, fetch and apply the default template
  useEffect(() => {
    const initializeApp = async () => {
      // Always load fresh from template file on app start
      const templateData = await loadDefaultTemplate()
      if (templateData) {
        setAppData(templateData)
        console.log('✅ Loaded template from default-template.json')
      } else {
        // Fallback: ensure existing data is properly shaped
        setAppData(prev => ensureAppDataShape(prev))
      }
      setIsLoading(false)
    }
    
    initializeApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save data whenever appData changes
  useEffect(() => {
    // This effect ensures data is always saved to localStorage
    // The useLocalStorage hook handles the actual saving
  }, [appData])

  const handleCompetitionChange = (competition: Competition) => {
    setAppData(prev => ({ ...prev, competition }))
  }

  const handleRunningOrderChange = (runningOrder: RunningOrderItem[]) => {
    setAppData(prev => ({ ...prev, runningOrder }))
  }

  const handleVenueChange = (venueId: string) => {
    setAppData(prev => ({
      ...prev,
      selectedVenue: venueId,
      matchConfig: {
        ...prev.matchConfig,
        stadiumId: venueId
      }
    }))
  }

  const handleMatchConfigChange = (matchConfig: MatchConfig) => {
    setAppData(prev => ({
      ...prev,
      matchConfig,
      selectedVenue: matchConfig.stadiumId
    }))
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'running-order-current-step',
          String(currentStep)
        )
      }
    } catch {
      // ignore
    }
  }, [currentStep])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const baseTitle = 'Infotainment Running Order Generator'
    const competitionTitle = appData?.competition?.name || appData?.competition?.name1
    document.title = competitionTitle ? `${competitionTitle} | ${baseTitle}` : baseTitle
  }, [appData.competition])

  // Show loading state while fetching template
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Top-level tabs to switch between steps - hidden in print */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 print:hidden app-nav-toggle">
        <div className="flex items-center bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 rounded-full shadow-lg backdrop-blur px-1 py-1">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={[
              'px-4 py-1.5 text-sm rounded-full transition',
              currentStep === 1
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
            ].join(' ')}
          >
            Setup
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={[
              'px-4 py-1.5 text-sm rounded-full transition',
              currentStep === 2
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
            ].join(' ')}
          >
            Running Order
          </button>
        </div>
      </div>

      {currentStep === 1 && (
        <CompetitionSetup
          competition={appData.competition}
          onCompetitionChange={handleCompetitionChange}
          onNext={nextStep}
        />
      )}

      {currentStep === 2 && (
        <RunningOrderTemplate
          competition={appData.competition}
          runningOrder={appData.runningOrder}
          categories={appData.categories}
          selectedVenue={appData.selectedVenue}
          matchConfig={appData.matchConfig}
          onUpdateRunningOrder={handleRunningOrderChange}
          onUpdateCategories={(categories) => setAppData(prev => ({ ...prev, categories }))}
          onVenueChange={handleVenueChange}
          onMatchConfigChange={handleMatchConfigChange}
          onCompetitionChange={handleCompetitionChange}
          onBack={prevStep}
        />
      )}
    </div>
  )
}

export default App
