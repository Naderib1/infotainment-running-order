import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { RunningOrderCards } from '@/components/RunningOrderCards'
import { Competition, RunningOrderItem, RunningOrderCategory, MatchConfig } from '@/types'
import { Printer, MapPin, Trophy, Calendar, Shield } from 'lucide-react'
import { applyTokens, TokenContext } from '@/lib/tokens'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PublicUserViewProps {
  competition: Competition
  runningOrder: RunningOrderItem[]
  categories: RunningOrderCategory[]
  loading: boolean
}

export function PublicUserView({ competition, runningOrder, categories, loading }: PublicUserViewProps) {
  const [matchConfig, setMatchConfig] = useState<MatchConfig>({
    teamAId: '',
    teamBId: '',
    stadiumId: '',
    matchTime: '',
    extraNotes: '',
    useGenericTeams: false
  })
  const [isExporting, setIsExporting] = useState(false)
  const pdfContentRef = useRef<HTMLDivElement>(null)

  const selectedStadium = competition.stadiums.find(s => s.id === matchConfig.stadiumId)
  const teamA = competition.teams.find(t => t.id === matchConfig.teamAId)
  const teamB = competition.teams.find(t => t.id === matchConfig.teamBId)

  const useGenericTeams = matchConfig.useGenericTeams ?? false
  const genericTeamLabels = {
    a: { name1: 'Team 1', name2: 'فريق ١' },
    b: { name1: 'Team 2', name2: 'فريق ٢' }
  }

  const resolvedTeamA = {
    name1: useGenericTeams ? genericTeamLabels.a.name1 : teamA?.name1 || genericTeamLabels.a.name1,
    name2: useGenericTeams ? genericTeamLabels.a.name2 : teamA?.name2 || genericTeamLabels.a.name2
  }

  const resolvedTeamB = {
    name1: useGenericTeams ? genericTeamLabels.b.name1 : teamB?.name1 || genericTeamLabels.b.name1,
    name2: useGenericTeams ? genericTeamLabels.b.name2 : teamB?.name2 || genericTeamLabels.b.name2
  }

  const tokenContext: TokenContext = {
    competition1: competition.name1,
    competition2: competition.name2 || competition.name1,
    stadium1: selectedStadium?.name1 || '',
    stadium2: selectedStadium?.name2 || selectedStadium?.name1 || '',
    city1: selectedStadium?.city1 || '',
    city2: selectedStadium?.city2 || selectedStadium?.city1 || '',
    teamA1: resolvedTeamA.name1,
    teamA2: resolvedTeamA.name2,
    teamB1: resolvedTeamB.name1,
    teamB2: resolvedTeamB.name2,
    matchTime: matchConfig.matchTime || ''
  }

  // Apply tokens to running order items
  const processedRunningOrder = runningOrder.map(item => ({
    ...item,
    script1: item.script1 ? applyTokens(item.script1, tokenContext) : item.script1,
    script2: item.script2 ? applyTokens(item.script2, tokenContext) : item.script2
  }))

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    if (!pdfContentRef.current || isExporting) return
    
    setIsExporting(true)
    try {
      const element = pdfContentRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      const teamNames = `${resolvedTeamA.name1} vs ${resolvedTeamB.name1}`
      pdf.save(`Running Order - ${teamNames}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 print:hidden">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {competition.name1 || 'Running Order Generator'}
          </h1>
          <p className="text-slate-600 mt-2">Select your match details and print the running order</p>
        </div>

        {/* Match Configuration Card */}
        <Card className="mb-6 print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Match Configuration
            </CardTitle>
            <CardDescription>Select the teams and venue for this match</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stadium Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  Stadium
                </Label>
                <Select
                  value={matchConfig.stadiumId}
                  onValueChange={(value) => setMatchConfig({ ...matchConfig, stadiumId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stadium" />
                  </SelectTrigger>
                  <SelectContent>
                    {competition.stadiums.map((stadium) => (
                      <SelectItem key={stadium.id} value={stadium.id}>
                        {stadium.name1} - {stadium.city1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Home Team */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Home Team
                </Label>
                <Select
                  value={matchConfig.teamAId}
                  onValueChange={(value) => setMatchConfig({ ...matchConfig, teamAId: value })}
                  disabled={matchConfig.useGenericTeams}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select home team" />
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

              {/* Away Team */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Away Team
                </Label>
                <Select
                  value={matchConfig.teamBId}
                  onValueChange={(value) => setMatchConfig({ ...matchConfig, teamBId: value })}
                  disabled={matchConfig.useGenericTeams}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select away team" />
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

              {/* Match Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  Match Time
                </Label>
                <Input
                  value={matchConfig.matchTime}
                  onChange={(e) => setMatchConfig({ ...matchConfig, matchTime: e.target.value })}
                  placeholder="e.g., 20:00 - 21 Dec 2025"
                />
              </div>
            </div>

            {/* Generic Teams Option */}
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="checkbox"
                id="useGenericTeams"
                checked={matchConfig.useGenericTeams}
                onChange={(e) => setMatchConfig({ ...matchConfig, useGenericTeams: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="useGenericTeams" className="text-sm text-slate-600">
                Use generic team names (Team 1 vs Team 2)
              </Label>
            </div>

            {/* Print Buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handlePrint}
                variant="gradient"
                size="lg"
                className="flex items-center gap-2"
              >
                <Printer className="h-5 w-5" />
                Print Running Order
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                size="lg"
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Running Order Display */}
        <div ref={pdfContentRef}>
          {/* Print Header */}
          <div className="hidden print:block mb-6 text-center">
            <h1 className="text-2xl font-bold">{competition.name1}</h1>
            <p className="text-lg mt-2">
              {resolvedTeamA.name1} vs {resolvedTeamB.name1}
            </p>
            {selectedStadium && (
              <p className="text-sm text-slate-600">
                {selectedStadium.name1}, {selectedStadium.city1}
              </p>
            )}
            {matchConfig.matchTime && (
              <p className="text-sm text-slate-600">{matchConfig.matchTime}</p>
            )}
          </div>

          <Card>
            <CardHeader className="print:hidden">
              <CardTitle>Running Order</CardTitle>
              <CardDescription>
                {processedRunningOrder.length} items across {categories.length} categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RunningOrderCards
                items={processedRunningOrder}
                categories={categories}
                onUpdateItem={() => {}}
                onDeleteItem={() => {}}
                onAddItemForCategory={() => {}}
                readOnly={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
