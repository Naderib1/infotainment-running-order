import { useState, useEffect, useCallback } from 'react'
import { CompetitionSetup } from './components/CompetitionSetup'
import { RunningOrderTemplate } from './components/RunningOrderTemplate'
import { GameSelector } from './components/GameSelector'
import { Auth } from './components/Auth'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useSupabaseData } from './hooks/useSupabaseData'
import { useAdmin } from './hooks/useAdmin'
import { useDefaultTemplate } from './hooks/useDefaultTemplate'
import { Competition, RunningOrderItem, AppData, MatchConfig } from './types'
import { defaultCategories, defaultRunningOrder, defaultStadiums, defaultTeams } from './data/defaultCategories'
import { ensureAppDataShape } from './lib/ensureShape'
import { LogOut, Save, Cloud, CloudOff, User, Shield, Upload, ChevronLeft } from 'lucide-react'
import { Button } from './components/ui/button'
import { Game } from './data/games'

// Path to the default template file in the public folder
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

// Public user flow component - shows game selector first, then running order
function PublicUserFlow({ template }: { template: AppData }) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  
  // When a game is selected, update the template with game info
  const getTemplateWithGameInfo = (): AppData => {
    if (!selectedGame) return template
    
    // Find matching teams and stadium from the template
    const teamA = template.competition.teams.find(t => 
      t.name1.toLowerCase() === selectedGame.teamA.toLowerCase()
    )
    const teamB = template.competition.teams.find(t => 
      t.name1.toLowerCase() === selectedGame.teamB.toLowerCase()
    )
    const stadium = template.competition.stadiums.find(s => 
      s.name1.toLowerCase().includes(selectedGame.stadium.toLowerCase().split(' ')[0]) ||
      selectedGame.stadium.toLowerCase().includes(s.name1.toLowerCase().split(' ')[0])
    )
    
    return {
      ...template,
      matchConfig: {
        ...template.matchConfig,
        teamAId: teamA?.id || '',
        teamBId: teamB?.id || '',
        stadiumId: stadium?.id || '',
        matchTime: `${selectedGame.date} ${selectedGame.time}`,
        extraNotes: `Match #${selectedGame.matchNumber}`
      },
      selectedVenue: stadium?.id || ''
    }
  }
  
  if (!selectedGame) {
    return (
      <div className="min-h-screen">
        {/* Admin login link at bottom */}
        <div className="fixed bottom-4 right-4 z-50 print:hidden">
          <Auth mode="link" />
        </div>
        
        <GameSelector 
          onSelectGame={(game) => setSelectedGame(game)}
        />
      </div>
    )
  }
  
  const gameTemplate = getTemplateWithGameInfo()
  
  return (
    <div className="min-h-screen">
      {/* Back to games button */}
      <div className="fixed top-4 left-4 z-50 print:hidden">
        <Button
          variant="outline"
          onClick={() => setSelectedGame(null)}
          className="flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Games
        </Button>
      </div>
      
      {/* Admin login link at bottom */}
      <div className="fixed bottom-4 right-4 z-50 print:hidden">
        <Auth mode="link" />
      </div>
      
      <RunningOrderTemplate
        competition={gameTemplate.competition}
        runningOrder={gameTemplate.runningOrder}
        categories={gameTemplate.categories}
        selectedVenue={gameTemplate.selectedVenue}
        matchConfig={gameTemplate.matchConfig}
        onUpdateRunningOrder={() => {}}
        onUpdateCategories={() => {}}
        onVenueChange={() => {}}
        onMatchConfigChange={() => {}}
        onCompetitionChange={() => {}}
        onResetAllData={() => {}}
        onBack={() => setSelectedGame(null)}
        readOnly={true}
      />
    </div>
  )
}

function AppContent() {
  const { user, loading: authLoading, signOut, isConfigured } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const { template, loading: templateLoading, saving: publishingSaving, saveTemplate } = useDefaultTemplate()
  
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 1
    try {
      const stored = window.localStorage.getItem('running-order-current-step')
      if (stored === '2') return 2
    } catch {
      // ignore
    }
    return 1
  })
  
  const { data: appData, setData: setAppData, loading: dataLoading, saving, lastSaved } = useSupabaseData(initialAppData)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Publish template to Supabase (admin only)
  const handlePublishTemplate = async () => {
    if (!isAdmin || !user?.email) return
    
    if (!confirm('Publish this template as the default for all users?\n\nThis will update the template that all public users see.')) {
      return
    }
    
    const success = await saveTemplate(appData, user.email)
    if (success) {
      alert('✅ Template published successfully!\n\nAll users will now see this template.')
    } else {
      alert('❌ Failed to publish template. Please try again.')
    }
  }

  // Function to load template from the default template file
  const loadDefaultTemplate = useCallback(async () => {
    try {
      const response = await fetch(DEFAULT_TEMPLATE_URL)
      if (!response.ok) {
        console.warn('Default template not found, using built-in defaults')
        return null
      }
      const templateData = await response.json()
      
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

  // Initialize app with template if user has no data
  useEffect(() => {
    const initializeData = async () => {
      if (dataLoading || isInitialized) return
      
      // If user has no data (new user), load from template
      if (appData.runningOrder.length === 0 || !appData.competition.name1) {
        const templateData = await loadDefaultTemplate()
        if (templateData) {
          setAppData(templateData)
          console.log('✅ Loaded default template for new user')
        }
      }
      setIsInitialized(true)
    }
    
    initializeData()
  }, [dataLoading, isInitialized, appData, loadDefaultTemplate, setAppData])

  const handleCompetitionChange = (competition: Competition) => {
    setAppData({ ...appData, competition })
  }

  const handleRunningOrderChange = (runningOrder: RunningOrderItem[]) => {
    setAppData({ ...appData, runningOrder })
  }

  const handleVenueChange = (venueId: string) => {
    setAppData({
      ...appData,
      selectedVenue: venueId,
      matchConfig: {
        ...appData.matchConfig,
        stadiumId: venueId
      }
    })
  }

  const handleMatchConfigChange = (matchConfig: MatchConfig) => {
    setAppData({
      ...appData,
      matchConfig,
      selectedVenue: matchConfig.stadiumId
    })
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
        window.localStorage.setItem('running-order-current-step', String(currentStep))
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

  // Show loading state
  if (authLoading || templateLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  // PUBLIC USER MODE: Show game selector first, then running order
  if (!user && template) {
    return <PublicUserFlow template={template} />
  }
  
  // Show login for admins if no template exists yet
  if (!user && !template) {
    return <Auth />
  }

  // Wait for admin data to load
  if (dataLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading admin data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* User info bar - only show if logged in */}
      {user && (
        <div className="fixed top-4 right-4 z-50 print:hidden flex items-center gap-2">
          {/* Admin badge and Publish button */}
          {isAdmin && (
            <>
              <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-full px-2 py-1">
                <Shield className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Admin</span>
              </div>
              <Button
                onClick={handlePublishTemplate}
                disabled={publishingSaving}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full px-3 py-1 h-auto text-xs flex items-center gap-1"
              >
                <Upload className="h-3.5 w-3.5" />
                {publishingSaving ? 'Publishing...' : 'Publish Template'}
              </Button>
            </>
          )}

          {/* Save status indicator */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 rounded-full shadow-lg backdrop-blur px-3 py-1.5">
            {saving ? (
              <>
                <Save className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-xs text-slate-600 dark:text-slate-300">Saving...</span>
              </>
            ) : (
              <>
                <Cloud className="h-4 w-4 text-green-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {lastSaved ? `Saved` : 'Synced'}
                </span>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 rounded-full shadow-lg backdrop-blur px-3 py-1.5">
            <User className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-600 dark:text-slate-300 max-w-[120px] truncate">
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="ml-1 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* Offline mode indicator */}
      {!isConfigured && (
        <div className="fixed top-4 right-4 z-50 print:hidden">
          <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-full shadow-lg px-3 py-1.5">
            <CloudOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-amber-700 dark:text-amber-300">Offline Mode</span>
          </div>
        </div>
      )}

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
          onUpdateCategories={(categories) => setAppData({ ...appData, categories })}
          onVenueChange={handleVenueChange}
          onMatchConfigChange={handleMatchConfigChange}
          onCompetitionChange={handleCompetitionChange}
          onResetAllData={(newData) => setAppData(newData)}
          onBack={prevStep}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
