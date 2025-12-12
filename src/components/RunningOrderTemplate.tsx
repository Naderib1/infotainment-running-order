import { useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddItemDialog } from '@/components/AddItemDialog'
import { CategoryManager } from '@/components/CategoryManager'
import { RunningOrderCards } from '@/components/RunningOrderCards'
import { RunningOrderTable } from '@/components/RunningOrderTable'
import { Competition, RunningOrderItem, RunningOrderCategory, MatchConfig } from '@/types'
import { 
  ChevronLeft, 
  Plus, 
  FileText,
  Download,
  Table,
  LayoutGrid,
  MapPin,
  Calendar,
  Trophy,
  RotateCcw
} from 'lucide-react'
import { applyTokens, TokenContext } from '@/lib/tokens'
import { ensureAppDataShape } from '@/lib/ensureShape'
import { getCategoryPaletteEntry } from '@/data/categoryPalette'
import { downloadFile } from '@/lib/utils'
import { GameExtras } from '@/hooks/useGameExtras'

interface RunningOrderTemplateProps {
  competition: Competition
  runningOrder: RunningOrderItem[]
  categories: RunningOrderCategory[]
  selectedVenue: string
  matchConfig: MatchConfig
  onUpdateRunningOrder: (items: RunningOrderItem[]) => void
  onUpdateCategories: (categories: RunningOrderCategory[]) => void
  onVenueChange: (venueId: string) => void
  onMatchConfigChange: (config: MatchConfig) => void
  onCompetitionChange: (competition: Competition) => void
  onResetAllData: (data: { competition: Competition; runningOrder: RunningOrderItem[]; categories: RunningOrderCategory[]; selectedVenue: string; matchConfig: MatchConfig }) => void
  onBack: () => void
  readOnly?: boolean
  gameExtras?: GameExtras
  deactivatedItemNames?: string[]
}

export function RunningOrderTemplate({
  competition,
  runningOrder,
  categories,
  selectedVenue,
  matchConfig,
  onUpdateRunningOrder,
  onUpdateCategories,
  gameExtras,
  deactivatedItemNames = [],
  onVenueChange,
  onMatchConfigChange,
  onResetAllData,
  onBack,
  readOnly = false
}: RunningOrderTemplateProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDialogCategoryId, setAddDialogCategoryId] = useState<string | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const pdfContentRef = useRef<HTMLDivElement>(null)

  const effectiveStadiumId = matchConfig.stadiumId || selectedVenue
  const selectedStadium = competition.stadiums.find(
    s => s.id === effectiveStadiumId
  )

  const teamA = competition.teams.find(
    t => t.id === matchConfig.teamAId
  )
  const teamB = competition.teams.find(
    t => t.id === matchConfig.teamBId
  )

  const useGenericTeams = matchConfig.useGenericTeams ?? false
  const genericTeamLabels = {
    a: { name1: 'Team 1', name2: 'فريق ١' },
    b: { name1: 'Team 2', name2: 'فريق ٢' }
  }

  const resolvedTeamA = {
    name1: useGenericTeams
      ? genericTeamLabels.a.name1
      : teamA?.name1 || genericTeamLabels.a.name1,
    name2: useGenericTeams
      ? genericTeamLabels.a.name2
      : teamA?.name2 || genericTeamLabels.a.name2
  }

  const resolvedTeamB = {
    name1: useGenericTeams
      ? genericTeamLabels.b.name1
      : teamB?.name1 || genericTeamLabels.b.name1,
    name2: useGenericTeams
      ? genericTeamLabels.b.name2
      : teamB?.name2 || genericTeamLabels.b.name2
  }

  const formatDate = (value: string) => {
    if (!value) return ''
    const date = new Date(value)
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString()
  }

  const englishTeamSeparator = useGenericTeams ? ' / ' : ' vs '
  const arabicTeamSeparator = useGenericTeams ? ' \\ ' : ' ضد '
  const teamLine =
    resolvedTeamA.name1 && resolvedTeamB.name1
      ? `${resolvedTeamA.name1}${englishTeamSeparator}${resolvedTeamB.name1}`
      : ''
  const teamLineSecondary =
    resolvedTeamA.name2 && resolvedTeamB.name2
      ? `${resolvedTeamA.name2}${arabicTeamSeparator}${resolvedTeamB.name2}`
      : ''

  const tokenContext: TokenContext = useMemo(
    () => ({
      competition1: competition.name1,
      competition2: competition.name2,
      stadium1: selectedStadium?.name1 ?? '',
      stadium2: selectedStadium?.name2 ?? '',
      city1: selectedStadium?.city1 ?? '',
      city2: selectedStadium?.city2 ?? '',
      teamA1: resolvedTeamA.name1,
      teamA2: resolvedTeamA.name2,
      teamB1: resolvedTeamB.name1,
      teamB2: resolvedTeamB.name2,
      matchTime: matchConfig.matchTime
    }),
    [competition, selectedStadium, teamA, teamB, matchConfig.matchTime, matchConfig.useGenericTeams]
  )

  const presentationItems = useMemo(() => {
    const replaceTokens = (value?: string) =>
      value ? applyTokens(value, tokenContext) : value

    const resolveText = (value?: string, fallback = '') => {
      const replaced = replaceTokens(value)
      if (typeof replaced === 'string' && replaced.trim().length > 0) {
        return replaced
      }
      return fallback
    }

    return runningOrder.map(item => ({
      ...item,
      title: resolveText(item.title, 'Untitled item'),
      script1: replaceTokens(item.script1) ?? '',
      giantScreen: resolveText(item.giantScreen, 'Competition Logo'),
      pitchLed: resolveText(item.pitchLed, '—'),
      ledRing: resolveText(item.ledRing, '—'),
      lights: resolveText(item.lights, 'Normal Lights'),
      responsible: resolveText(item.responsible, 'Infotainment Operator'),
      notes: replaceTokens(item.notes) ?? '',
      audioOption: resolveText(item.audioOption, '')
    }))
  }, [runningOrder, tokenContext])

  const addItem = (itemData: Omit<RunningOrderItem, 'id'>) => {
    const newItem: RunningOrderItem = {
      ...itemData,
      id: Date.now().toString()
    }
    onUpdateRunningOrder([...runningOrder, newItem])
  }

  const updateItem = (id: string, updates: Partial<RunningOrderItem>) => {
    const updatedItems = runningOrder.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
    onUpdateRunningOrder(updatedItems)
  }

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedItems = runningOrder.filter(item => item.id !== id)
      onUpdateRunningOrder(updatedItems)
    }
  }

  const itemsPerCategory = runningOrder.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    },
    {}
  )
  const activeItemCount = runningOrder.filter(item => item.active !== false).length
  
  // Build header stats based on whether we have game extras (public view) or not (admin view)
  const headerStats: { label: string; value: string | number; isList?: boolean; items?: string[] }[] = []
  
  // Always show kick-off and venue
  if (matchConfig.matchTime) {
    headerStats.push({ label: 'Kick-off', value: matchConfig.matchTime })
  }
  if (selectedStadium) {
    headerStats.push({ label: 'Venue', value: `${selectedStadium.name1} – ${selectedStadium.city1}` })
  }
  
  // If we have game extras, show them instead of total items/categories
  if (gameExtras) {
    if (gameExtras.influencers?.length > 0) {
      headerStats.push({ label: 'Influencers', value: gameExtras.influencers.join(', '), isList: true, items: gameExtras.influencers })
    }
    if (gameExtras.legends?.length > 0) {
      headerStats.push({ label: 'Legends', value: gameExtras.legends.join(', '), isList: true, items: gameExtras.legends })
    }
    if (gameExtras.players_to_watch?.length > 0) {
      headerStats.push({ label: 'Players to Watch', value: gameExtras.players_to_watch.join(', '), isList: true, items: gameExtras.players_to_watch })
    }
    if (gameExtras.trivia_moments?.length > 0) {
      headerStats.push({ label: 'Trivia Moments', value: gameExtras.trivia_moments.length.toString(), isList: true, items: gameExtras.trivia_moments })
    }
    if (deactivatedItemNames.length > 0) {
      headerStats.push({ label: 'Deactivated', value: deactivatedItemNames.join(', '), isList: true, items: deactivatedItemNames })
    }
  } else {
    // Admin view - show total items and categories
    headerStats.push({ label: 'Total items', value: activeItemCount })
    headerStats.push({ label: 'Categories', value: categories.length })
    if (matchConfig.extraNotes) {
      headerStats.push({ label: 'Notes', value: matchConfig.extraNotes })
    }
  }
  const competitionLogo = competition.logoDataUrl || competition.branding.logo
  const coverPrimary =
    competition.branding.primaryColor || '#8D0000'
  const coverSecondary =
    competition.branding.secondaryColor || '#640000'

  const exportToHTML = () => {
    if (!pdfContentRef.current) return
    const exportMarkup = pdfContentRef.current.innerHTML
    const css = `:root { color-scheme: light; }
* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; background: #fff; color: #0f172a; }
.export-wrapper { max-width: 210mm; margin: 0 auto; }
.glass-card { background: rgba(255,255,255,0.95); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; }
.category-section { page-break-before: always; }
.running-order-card { page-break-inside: avoid; margin-bottom: 5mm; }
@page { size: A4; margin: 10mm 8mm; }`
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${competition.name1} - Infotainment Running Order</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<style>${css}</style>
</head>
<body>
<div class="export-wrapper">${exportMarkup}</div>
</body>
</html>`
    const filename = `${competition.name1} - Infotainment Running Order.html`
    downloadFile(html, filename, 'text/html')
  }

  const handlePrintView = () => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('print')
    let handleChange: ((event: MediaQueryListEvent) => void) | null = null

    const cleanup = () => {
      document.body.classList.remove('print-running-order')
      window.removeEventListener('afterprint', cleanup)
      if (handleChange) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleChange)
        } else {
          mediaQuery.removeListener(handleChange)
        }
      }
    }

    handleChange = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        cleanup()
      }
    }

    document.body.classList.add('print-running-order')
    window.addEventListener('afterprint', cleanup)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }
    window.print()
  }

  const resetToDefault = async () => {
    if (!confirm('Reset to default AFCON template?\n\nThis will replace all current data with the default template.')) {
      return
    }
    
    try {
      const response = await fetch('/default-template.json')
      if (!response.ok) {
        throw new Error('Failed to fetch default template')
      }
      const templateData = await response.json()
      
      const normalized = ensureAppDataShape({
        competition: templateData.competition || competition,
        runningOrder: templateData.runningOrder || [],
        categories: templateData.categories || [],
        selectedVenue: templateData.selectedVenue ?? selectedVenue,
        matchConfig: templateData.matchConfig ?? matchConfig
      })

      // Update all data in a single call to avoid race conditions
      onResetAllData({
        competition: normalized.competition,
        runningOrder: normalized.runningOrder,
        categories: normalized.categories,
        selectedVenue: normalized.selectedVenue,
        matchConfig: normalized.matchConfig
      })
      
      alert(`✅ Reset to default template!\n\nItems: ${normalized.runningOrder.length}\nCategories: ${normalized.categories.length}`)
    } catch (error) {
      console.error('Error resetting to default:', error)
      alert('❌ Error loading default template.')
    }
  }

  return (
    <>
    <div className="app-shell min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header controls - with padding top to avoid overlap with fixed nav */}
        <div className="flex items-center justify-between mb-6 pt-14">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Setup
          </Button>

          <div className="flex items-center gap-3">
            {/* Export HTML Button */}
            <Button
              onClick={exportToHTML}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export HTML
            </Button>
            {/* Print Button */}
            <Button
              onClick={handlePrintView}
              variant="gradient"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Hero cover */}
        <div className="mb-10">
          <div
            className="relative overflow-hidden rounded-[40px] text-white shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${coverPrimary}, ${coverSecondary})`,
              minHeight: '420px',
              padding: '48px'
            }}
          >
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/15 blur-3xl" />
              <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
            </div>
            <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between h-full">
              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white/15 rounded-3xl p-4 shadow-lg backdrop-blur">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                  {competitionLogo && (
                    <div className="bg-white/10 rounded-3xl p-4 backdrop-blur shadow">
                      <img
                        src={competitionLogo}
                        alt="Competition logo"
                        className="h-24 w-auto object-contain"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.5em] text-white/70">
                    Infotainment Running Order
                  </p>
                  <h1 className="text-4xl font-bold leading-tight mt-4">
                    {competition.name1}
                  </h1>
                  {teamLine && (
                    <p className="text-xl font-semibold mt-6">{teamLine}</p>
                  )}
                  {teamLineSecondary && (
                    <p className="text-base text-white/80">{teamLineSecondary}</p>
                  )}
                  <div className="flex items-center gap-2 text-white/80 mt-6">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">
                      {formatDate(competition.startDate) || '-'} – {formatDate(competition.endDate) || '-'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 self-end">
                {headerStats.map(stat => (
                  <div key={stat.label} className={`bg-white/15 rounded-2xl p-4 backdrop-blur ${stat.isList ? 'text-left' : 'text-center'}`}>
                    <div className="text-xs uppercase tracking-[0.4em] text-white/70">
                      {stat.label}
                    </div>
                    {stat.isList && stat.items ? (
                      <div className="mt-2 space-y-1">
                        {stat.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="text-sm font-medium truncate">{item}</div>
                        ))}
                        {stat.items.length > 3 && (
                          <div className="text-xs text-white/60">+{stat.items.length - 3} more</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xl font-semibold mt-2">{stat.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category overview */}
        {categories.length > 0 && (
          <div className="mb-10">
            <div className="glass-card border-0 rounded-3xl shadow-lg bg-white/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Category Overview</h2>
                <span className="text-sm text-slate-500">{categories.length} categories</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category, idx) => {
                  const palette = getCategoryPaletteEntry(idx)
                  const count = itemsPerCategory[category.id] || 0
                  return (
                    <div
                      key={category.id}
                      className="relative overflow-hidden rounded-2xl p-4 text-white shadow"
                      style={{
                        background: `linear-gradient(120deg, ${palette.bannerFrom}, ${palette.bannerTo})`
                      }}
                    >
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute -top-6 -left-4 w-24 h-24 rounded-full bg-white/30 blur-2xl" />
                        <div className="absolute -bottom-6 -right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/70">Category</p>
                        <h3 className="text-lg font-semibold mt-1">{category.name}</h3>
                        <p className="text-sm text-white/80 mt-2">{count} items</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Print-only header with match details */}
        <div className="hidden print-running-header text-xs text-slate-700 mb-4">
          <div className="font-semibold">
            {competition.name1}
          </div>
          <div>
            {teamLine && <span>{teamLine}</span>}
            {matchConfig.matchTime && (
              <span>{teamLine ? ' • ' : ''}Kick-off: {matchConfig.matchTime}</span>
            )}
          </div>
          {teamLineSecondary && (
            <div>{teamLineSecondary}</div>
          )}
          {selectedStadium && (
            <div>
              {selectedStadium.name1} – {selectedStadium.city1}
            </div>
          )}
        </div>

        {/* Match Configuration */}
        <Card className="glass-card border-0 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Match Configuration
                </CardTitle>
                <CardDescription>
                  Select teams, stadium, and match details. Language 1 = English, Language 2 = Arabic. Use tokens like [TeamA1]/[TeamA2], [TeamB1]/[TeamB2], [Stadium1]/[Stadium2], [City1]/[City2], and [MatchTime] in your titles and scripts – they will be replaced on the generated sheet.
                </CardDescription>
              </div>
              <div className="hidden md:flex flex-col items-end text-xs text-muted-foreground">
                <span className="font-medium">
                  {runningOrder.length} total items
                </span>
                <span>
                  {categories.length} categories
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Team A */}
              <div className="space-y-2">
                <Label>Team A</Label>
                <Select
                  value={matchConfig.teamAId}
                  disabled={matchConfig.useGenericTeams}
                  onValueChange={(value) =>
                    onMatchConfigChange({ ...matchConfig, teamAId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Team A" />
                  </SelectTrigger>
                  <SelectContent>
                    {competition.teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team B */}
              <div className="space-y-2">
                <Label>Team B</Label>
                <Select
                  value={matchConfig.teamBId}
                  disabled={matchConfig.useGenericTeams}
                  onValueChange={(value) =>
                    onMatchConfigChange({ ...matchConfig, teamBId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Team B" />
                  </SelectTrigger>
                  <SelectContent>
                    {competition.teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Need a generic running order? Toggle to use Team 1 / فريق ١ and Team 2 / فريق ٢ placeholders.
              </p>
              <Button
                variant={matchConfig.useGenericTeams ? 'gradient' : 'outline'}
                size="sm"
                onClick={() =>
                  onMatchConfigChange({
                    ...matchConfig,
                    useGenericTeams: !matchConfig.useGenericTeams,
                    teamAId: '',
                    teamBId: ''
                  })
                }
              >
                {matchConfig.useGenericTeams
                  ? 'Generic Teams Enabled'
                  : 'Use Generic Teams (Team 1 / فريق ١)'}
              </Button>
            </div>
            {matchConfig.useGenericTeams && (
              <p className="text-xs text-muted-foreground mt-2">
                Team selection is disabled while generic teams are active.
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {/* Stadium */}
              <div className="space-y-2">
                <Label>Stadium</Label>
                <Select
                  value={matchConfig.stadiumId || selectedVenue}
                  onValueChange={(value) => {
                    onVenueChange(value)
                    onMatchConfigChange({ ...matchConfig, stadiumId: value })
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Stadium">
                      {selectedStadium && (
                        <span>
                          {selectedStadium.name1} ({selectedStadium.city1})
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {competition.stadiums.map((stadium) => (
                      <SelectItem key={stadium.id} value={stadium.id}>
                        {stadium.name1} ({stadium.city1})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Match Time */}
              <div className="space-y-2">
                <Label>Match Time</Label>
                <Input
                  value={matchConfig.matchTime}
                  onChange={(e) =>
                    onMatchConfigChange({
                      ...matchConfig,
                      matchTime: e.target.value
                    })
                  }
                  placeholder="e.g., 2025-06-01 20:00"
                />
              </div>
            </div>

            {/* Extra Notes */}
            <div className="space-y-2 mt-4">
              <Label>Extra Notes</Label>
              <textarea
                className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background resize-none"
                value={matchConfig.extraNotes}
                onChange={(e) =>
                  onMatchConfigChange({
                    ...matchConfig,
                    extraNotes: e.target.value
                  })
                }
                placeholder="Any extra notes to appear in the header."
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Management - Admin only */}
        {!readOnly && (
          <div className="mb-8">
            <CategoryManager
              categories={categories}
              runningOrderCountByCategory={itemsPerCategory}
              onUpdateCategories={onUpdateCategories}
            />
          </div>
        )}

        {/* Running Order Management */}
        <Card className="glass-card border-0 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Running Order Items</CardTitle>
                <CardDescription>
                  Manage your competition running order timeline
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="flex items-center gap-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex items-center gap-2"
                  >
                    <Table className="h-4 w-4" />
                    Table
                  </Button>
                </div>

                {!readOnly && (
                  <>
                    {/* Reset to Default Button */}
                    <Button
                      onClick={resetToDefault}
                      variant="outline"
                      className="flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to Default
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setAddDialogCategoryId(undefined)
                        setAddDialogOpen(true)
                      }}
                      variant="gradient"
                      disabled={categories.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </>
                )}
              </div>
            </div>
            {categories.length === 0 && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  ⚠️ Please create at least one category before adding running order items
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {viewMode === 'cards' ? (
              <RunningOrderCards
                items={runningOrder}
                categories={categories}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
                onAddItemForCategory={(categoryId) => {
                  setAddDialogCategoryId(categoryId)
                  setAddDialogOpen(true)
                }}
                readOnly={readOnly}
              />
            ) : (
              <RunningOrderTable
                items={runningOrder}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
              />
            )}
          </CardContent>
        </Card>

        {/* Floating Add Item button (bottom-right) */}
        <button
          type="button"
          onClick={() => {
            setAddDialogCategoryId(undefined)
            setAddDialogOpen(true)
          }}
          className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* Add Item Dialog */}
        <AddItemDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAddItem={addItem}
          categories={categories}
           initialCategoryId={addDialogCategoryId}
        />

      </div>
    </div>

    {/* Hidden export container for print/HTML exports */}
        <div
          id="print-export-view"
          ref={pdfContentRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            transform: 'translate(-200vw, -200vh)',
            width: '210mm',
            padding: 0,
            margin: 0,
            zIndex: -1,
            background: 'transparent',
            pointerEvents: 'none'
          }}
        >
              {/* Simplified A4 Cover Page */}
              <div
                className="cover-page"
                data-export="cover-page"
                style={{
                  width: '210mm',
                  height: '297mm',
                  maxHeight: '297mm',
                  background: coverPrimary,
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                  boxSizing: 'border-box',
                  pageBreakAfter: 'always',
                  breakAfter: 'page',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  overflow: 'hidden',
                  padding: '20mm'
                      }}
                    >
                {/* Logo - centered and large */}
                {competitionLogo && (
                      <img
                        src={competitionLogo}
                        alt="Competition logo"
                  style={{
                      width: '120mm', 
                      height: '120mm', 
                      objectFit: 'contain',
                      marginBottom: '15mm'
                    }}
                  />
                )}
                
                {/* Infotainment Running Order text */}
                <p style={{ 
                  letterSpacing: '0.4em', 
                  textTransform: 'uppercase', 
                  fontSize: '14pt', 
                  opacity: 0.9, 
                  margin: '0 0 12mm', 
                  fontWeight: 500,
                  textAlign: 'center'
                }}>
                  Infotainment Running Order
                </p>
                
                {/* Team A VS Team B */}
                {teamLine && (
                  <p style={{ 
                    fontSize: '24pt', 
                    fontWeight: 700, 
                    margin: '0 0 4mm', 
                    lineHeight: 1.3,
                    textAlign: 'center'
                  }}>
                    {teamLine}
                  </p>
                )}
                
                {/* Arabic team names */}
                {teamLineSecondary && (
                  <p style={{ 
                    fontSize: '20pt', 
                    fontWeight: 600,
                    opacity: 0.9, 
                    margin: '0 0 15mm', 
                    lineHeight: 1.4,
                        textAlign: 'center',
                    direction: 'rtl'
                  }}>
                    {teamLineSecondary}
                  </p>
                )}
                
                {/* Match Time & Venue */}
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '14pt', 
                  opacity: 0.9,
                  marginTop: '10mm'
                }}>
                  {matchConfig.matchTime && (
                    <p style={{ margin: '0 0 4mm', fontWeight: 500 }}>
                      {matchConfig.matchTime}
                    </p>
                  )}
                  {selectedStadium && (
                    <p style={{ margin: 0 }}>
                      {selectedStadium.name1} – {selectedStadium.city1}
                    </p>
                  )}
                  </div>
                          </div>

              {/* Category Overview removed from print */}

                  <RunningOrderCards
                    items={presentationItems}
                    categories={categories}
                    onUpdateItem={updateItem}
                    onDeleteItem={deleteItem}
                    mode="presentation"
                  />
        </div>
    </>
  )
}
