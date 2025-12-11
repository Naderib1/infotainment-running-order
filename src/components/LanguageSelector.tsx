import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { languages } from '@/data/languages'
import { ChevronRight, Globe } from 'lucide-react'

interface LanguageSelectorProps {
  primaryLanguage: string
  secondaryLanguage: string
  onLanguageChange: (primary: string, secondary: string) => void
  onNext: () => void
}

export function LanguageSelector({ 
  primaryLanguage, 
  secondaryLanguage, 
  onLanguageChange, 
  onNext 
}: LanguageSelectorProps) {
  const [primary, setPrimary] = useState(primaryLanguage)
  const [secondary, setSecondary] = useState(secondaryLanguage)

  const handlePrimaryChange = (value: string) => {
    setPrimary(value)
    if (value === secondary) {
      setSecondary('')
    }
    onLanguageChange(value, value === secondary ? '' : secondary)
  }

  const handleSecondaryChange = (value: string) => {
    setSecondary(value)
    onLanguageChange(primary, value)
  }

  const isValid = primary && secondary && primary !== secondary
  const primaryLang = languages.find(l => l.code === primary)
  const secondaryLang = languages.find(l => l.code === secondary)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="glass-card p-4 rounded-full">
              <Globe className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Language Setup
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose your primary and secondary languages for the competition
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Primary Language
              </CardTitle>
              <CardDescription>
                Main language for the competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={primary} onValueChange={handlePrimaryChange}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select primary language">
                    {primaryLang && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{primaryLang.flag}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{primaryLang.name}</span>
                          <span className="text-sm text-muted-foreground">{primaryLang.nativeName}</span>
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code}
                      disabled={lang.code === secondary}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{lang.name}</span>
                          <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Secondary Language
              </CardTitle>
              <CardDescription>
                Additional language for bilingual content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={secondary} onValueChange={handleSecondaryChange}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select secondary language">
                    {secondaryLang && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{secondaryLang.flag}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{secondaryLang.name}</span>
                          <span className="text-sm text-muted-foreground">{secondaryLang.nativeName}</span>
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code}
                      disabled={lang.code === primary}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{lang.name}</span>
                          <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {isValid && (
          <Card className="glass-card border-0 mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Selected Languages</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{primaryLang?.flag}</span>
                    <div>
                      <div className="font-medium">{primaryLang?.name}</div>
                      <div className="text-sm text-muted-foreground">Primary</div>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-muted-foreground" />
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{secondaryLang?.flag}</span>
                    <div>
                      <div className="font-medium">{secondaryLang?.name}</div>
                      <div className="text-sm text-muted-foreground">Secondary</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button 
            onClick={onNext}
            disabled={!isValid}
            variant="gradient"
            size="lg"
            className="px-8"
          >
            Continue to Competition Setup
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
