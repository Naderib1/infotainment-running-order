import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/DatePicker'
import { Competition } from '@/types'
import { ChevronRight, Calendar, Trophy, Palette, MapPin, Users } from 'lucide-react'
import { convertImageToBase64 } from '@/lib/utils'

interface CompetitionSetupProps {
  competition: Competition
  onCompetitionChange: (competition: Competition) => void
  onNext: () => void
}

export function CompetitionSetup({
  competition,
  onCompetitionChange,
  onNext
}: CompetitionSetupProps) {
  const handleNameChange = (field: 'name1' | 'name2', value: string) => {
    onCompetitionChange({
      ...competition,
      [field]: value,
      // Keep legacy single-name field in sync
      name: field === 'name1' ? value : competition.name || value
    })
  }

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      onCompetitionChange({
        ...competition,
        [field]: date.toISOString()
      })
    }
  }

  const handleStadiumChange = (
    stadiumId: string,
    field: 'name1' | 'name2' | 'city1' | 'city2',
    value: string
  ) => {
    const updatedStadiums = competition.stadiums.map(stadium =>
      stadium.id === stadiumId ? { ...stadium, [field]: value } : stadium
    )
    onCompetitionChange({
      ...competition,
      stadiums: updatedStadiums
    })
  }

  const handleAddStadium = () => {
    const newStadium = {
      id: `stadium-${competition.stadiums.length + 1}`,
      name1: '',
      name2: '',
      city1: '',
      city2: ''
    }
    onCompetitionChange({
      ...competition,
      stadiums: [...competition.stadiums, newStadium]
    })
  }

  const handleRemoveStadium = (stadiumId: string) => {
    onCompetitionChange({
      ...competition,
      stadiums: competition.stadiums.filter(stadium => stadium.id !== stadiumId)
    })
  }

  const handleTeamChange = (teamId: string, field: 'name1' | 'name2', value: string) => {
    const updatedTeams = competition.teams.map(team =>
      team.id === teamId ? { ...team, [field]: value } : team
    )
    onCompetitionChange({
      ...competition,
      teams: updatedTeams
    })
  }

  const handleAddTeam = () => {
    const newTeam = {
      id: `team-${competition.teams.length + 1}`,
      name1: '',
      name2: ''
    }
    onCompetitionChange({
      ...competition,
      teams: [...competition.teams, newTeam]
    })
  }

  const handleRemoveTeam = (teamId: string) => {
    onCompetitionChange({
      ...competition,
      teams: competition.teams.filter(team => team.id !== teamId)
    })
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const base64 = await convertImageToBase64(file)
      onCompetitionChange({
        ...competition,
        logoDataUrl: base64,
        branding: {
          ...competition.branding,
          logo: base64
        }
      })
    }
  }

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    onCompetitionChange({
      ...competition,
      branding: {
        ...competition.branding,
        [field]: value
      }
    })
  }

  const handleRemoveLogo = () => {
    onCompetitionChange({
      ...competition,
      logoDataUrl: '',
      branding: {
        ...competition.branding,
        logo: ''
      }
    })
  }

  const isValid = competition.name1 && 
                  competition.startDate && 
                  competition.endDate

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="glass-card p-4 rounded-full">
              <Trophy className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            CAF Infotainment Running Order Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Configure your competition details and branding
          </p>
        </div>

        <div className="space-y-8">
          {/* Competition Name */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Competition Name
              </CardTitle>
              <CardDescription>
                Language 1 is English and Language 2 is Arabic. Both versions can be used with tokens in your scripts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Competition Name (Language 1 – English)</Label>
                  <Input
                    value={competition.name1}
                    onChange={(e) => handleNameChange('name1', e.target.value)}
                    placeholder="TotalEnergies CAF Africa Cup of Nations, Morocco 2025"
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Competition Name (Language 2 – Arabic)</Label>
                  <Input
                    value={competition.name2}
                    onChange={(e) => handleNameChange('name2', e.target.value)}
                    placeholder="Optional second-language name"
                    className="text-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Dates */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Dates
              </CardTitle>
              <CardDescription>
                Select the start and end dates for your competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <DatePicker
                    date={competition.startDate ? new Date(competition.startDate) : undefined}
                    onSelect={(date) => handleDateChange('startDate', date)}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <DatePicker
                    date={competition.endDate ? new Date(competition.endDate) : undefined}
                    onSelect={(date) => handleDateChange('endDate', date)}
                    placeholder="Select end date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stadium Management */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Stadiums & Cities
              </CardTitle>
              <CardDescription>
                Set up your stadiums. Language 1 = English, Language 2 = Arabic. Use tokens like [Stadium1]/[Stadium2] and [City1]/[City2] in your scripts – they will be replaced on the match sheet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competition.stadiums.map((stadium) => (
                  <div
                    key={stadium.id}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg items-start"
                  >
                    <div className="space-y-2 md:col-span-2">
                      <Label>Name (Language 1 – English)</Label>
                      <Input
                        value={stadium.name1}
                        onChange={(e) =>
                          handleStadiumChange(stadium.id, 'name1', e.target.value)
                        }
                        placeholder="Adrar Stadium"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Name (Language 2 – Arabic)</Label>
                      <Input
                        value={stadium.name2}
                        onChange={(e) =>
                          handleStadiumChange(stadium.id, 'name2', e.target.value)
                        }
                        placeholder="Adrar Stadium"
                      />
                    </div>
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-700 mt-6"
                      onClick={() => handleRemoveStadium(stadium.id)}
                    >
                      Remove
                    </button>
                    <div className="space-y-2 md:col-span-2">
                      <Label>City (Language 1 – English)</Label>
                      <Input
                        value={stadium.city1}
                        onChange={(e) =>
                          handleStadiumChange(stadium.id, 'city1', e.target.value)
                        }
                        placeholder="Agadir"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>City (Language 2 – Arabic)</Label>
                      <Input
                        value={stadium.city2}
                        onChange={(e) =>
                          handleStadiumChange(stadium.id, 'city2', e.target.value)
                        }
                        placeholder="Agadir"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddStadium}
                  className="mt-2"
                >
                  + Add Stadium
                </Button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Placeholder Tips:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">[Stadium1]</code> / <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">[Stadium2]</code> for stadium names in language 1 / 2</li>
                  <li>• Use <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">[City1]</code> / <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">[City2]</code> for city names in language 1 / 2</li>
                  <li>• Legacy tokens <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">[Stadium]</code> and <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">[City]</code> still map to language 1</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Teams */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teams
              </CardTitle>
              <CardDescription>
                Manage the teams available for match configuration. Language 1 = English, Language 2 = Arabic. Use tokens like [TeamA1]/[TeamA2] and [TeamB1]/[TeamB2] in your scripts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competition.teams.map((team) => (
                  <div
                    key={team.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg items-center"
                  >
                    <div className="space-y-2 md:col-span-1">
                      <Label>Name (Language 1 – English)</Label>
                      <Input
                        value={team.name1}
                        onChange={(e) =>
                          handleTeamChange(team.id, 'name1', e.target.value)
                        }
                        placeholder="Morocco"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label>Name (Language 2 – Arabic)</Label>
                      <Input
                        value={team.name2}
                        onChange={(e) =>
                          handleTeamChange(team.id, 'name2', e.target.value)
                        }
                        placeholder="المغرب"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveTeam(team.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTeam}
                className="mt-4"
              >
                + Add Team
              </Button>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Competition Branding
              </CardTitle>
              <CardDescription>
                Upload your logo and customize colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Competition Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                  </div>
                  {(competition.logoDataUrl || competition.branding.logo) && (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border">
                        <img
                          src={competition.logoDataUrl || competition.branding.logo}
                          alt="Competition Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveLogo}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={competition.branding.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={competition.branding.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={competition.branding.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={competition.branding.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-8">
          <Button 
            onClick={onNext}
            disabled={!isValid}
            variant="gradient"
            size="lg"
            className="px-8"
          >
            Continue to Running Order
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
