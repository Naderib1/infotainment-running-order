import { useMemo, useRef } from 'react'
import { ChevronLeft, FileText, Download, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { 
  FanZoneSchedule,
  defaultNonMatchdaySchedule 
} from '../data/fanZoneSchedule'
import { downloadFile } from '../lib/utils'
import { getCategoryPaletteEntry } from '../data/categoryPalette'

interface FanZoneNonMatchdaysProps {
  schedule?: FanZoneSchedule
  onBack: () => void
}

// Get color index based on time category
const getTimeColorIndex = (timeStr: string): number => {
  if (!timeStr) return 0
  const s = timeStr.trim().toUpperCase()
  
  // FT items - purple/closing color
  if (s.startsWith('FT')) return 4
  
  // HT items - orange/entertainment color
  if (s.startsWith('HT')) return 3
  
  // Positive times (after kick-off) - green/match color
  if (s.startsWith('+') || s.startsWith('T+')) return 2
  
  // Negative times (before kick-off) - blue/music color
  if (s.startsWith('-') || s.startsWith('T-')) return 1
  
  // KO - red/opening color
  if (s === 'KO' || s.includes('KICK')) return 0
  
  // Default
  return 0
}

// Parse time string to minutes for sorting
const parseTime = (timeStr: string): number => {
  if (!timeStr) return 99999
  const s = timeStr.trim().toUpperCase()
  
  // Check for HT prefix first
  if (s.startsWith('HT')) {
    const htTimeMatch = s.match(/^HT\s*([+-])?(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    if (htTimeMatch) {
      const sign = htTimeMatch[1] === '-' ? -1 : 1
      const hours = parseInt(htTimeMatch[2], 10)
      const minutes = parseInt(htTimeMatch[3], 10)
      return 10000 + sign * (hours * 60 + minutes)
    }
    if (s.includes('START')) return 10000
    if (s.includes('WINDOW')) return 10005
    if (s.includes('END')) return 10010
    return 10000
  }
  
  // Check for FT prefix
  if (s.startsWith('FT')) {
    const ftTimeMatch = s.match(/^FT\s*([+-])?(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    if (ftTimeMatch) {
      const sign = ftTimeMatch[1] === '-' ? -1 : 1
      const hours = parseInt(ftTimeMatch[2], 10)
      const minutes = parseInt(ftTimeMatch[3], 10)
      return 20000 + sign * (hours * 60 + minutes)
    }
    return 20000
  }
  
  // Handle -HH:MM:SS or +HH:MM:SS format
  const hhmmssMatch = s.match(/^([+-])?(\d{1,2}):(\d{2}):(\d{2})$/)
  if (hhmmssMatch) {
    const sign = hhmmssMatch[1] === '-' ? -1 : 1
    const hours = parseInt(hhmmssMatch[2], 10)
    const minutes = parseInt(hhmmssMatch[3], 10)
    return sign * (hours * 60 + minutes)
  }
  
  // Handle -HH:MM or +HH:MM format
  const hhmmMatch = s.match(/^([+-])?(\d{1,2}):(\d{2})$/)
  if (hhmmMatch) {
    const sign = hhmmMatch[1] === '-' ? -1 : 1
    const hours = parseInt(hhmmMatch[2], 10)
    const minutes = parseInt(hhmmMatch[3], 10)
    return sign * (hours * 60 + minutes)
  }
  
  // Handle T-XXX format
  const tMinusMatch = s.match(/^T-(\d+)/)
  if (tMinusMatch) {
    return -parseInt(tMinusMatch[1], 10)
  }
  
  // Handle T+XXX format
  const tPlusMatch = s.match(/^T\+(\d+)/)
  if (tPlusMatch) {
    return parseInt(tPlusMatch[1], 10)
  }
  
  // Handle KO
  if (s === 'KO' || s.includes('KICK')) return 0
  
  // Handle plain +XX format
  const plusMatch = s.match(/^\+(\d+)/)
  if (plusMatch) {
    return parseInt(plusMatch[1], 10)
  }
  
  // Fallback: try to parse as HH:MM
  const parts = s.split(':').map(Number)
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1]
  }
  
  return 99999
}

export function FanZoneNonMatchdays({ schedule = defaultNonMatchdaySchedule, onBack }: FanZoneNonMatchdaysProps) {
  const pdfContentRef = useRef<HTMLDivElement>(null)
  
  // Sort all items by time
  const sortedItems = useMemo(() => {
    return [...schedule.items].sort((a, b) => parseTime(a.time) - parseTime(b.time))
  }, [schedule.items])

  const handleExportPDF = async () => {
    if (!pdfContentRef.current) return
    
    const content = pdfContentRef.current.innerHTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Fan Zone Non-Matchday Running Order - AFCON 2025</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `
    downloadFile(htmlContent, 'fan-zone-non-matchday-running-order.html', 'text/html')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 print:bg-white print:min-h-0">
      {/* Back Button - hidden in print */}
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

      {/* Export Buttons - hidden in print */}
      <div className="fixed top-4 right-4 z-50 print:hidden flex gap-2">
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg"
        >
          <FileText className="h-4 w-4" />
          Print
        </Button>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Screen View */}
      <div className="container mx-auto px-4 py-20 max-w-4xl print:hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Fan Zone Running Order
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Non-Matchdays Schedule
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            AFCON 2025 Morocco
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Non-Matchday Schedule</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Fan Zone activities for non-match days</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Total Items</div>
                  <div className="text-2xl font-bold">{schedule.items.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Running Order Items */}
        <div className="space-y-4">
          {sortedItems.map((item) => {
            const idx = getTimeColorIndex(item.time)
            const palette = getCategoryPaletteEntry(idx)
            
            return (
              <Card
                key={item.id}
                className="glass-card border-0 overflow-hidden running-order-card"
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Time Badge */}
                    <div
                      className={`${palette.timeClass} text-white p-4 flex items-center justify-center min-w-[100px]`}
                    >
                      <span className="text-lg font-bold">{item.time || '--:--'}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      {/* Title */}
                      <div className="inline-block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 mb-3 shadow-sm">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.title || 'Untitled'}
                        </span>
                      </div>

                      {/* Screens */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Screen 1</div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {item.screens.screen1 || '-'}
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Screen 2</div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {item.screens.screen2 || '-'}
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Screen 3</div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {item.screens.screen3 || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Print View */}
      <div ref={pdfContentRef} className="hidden print:block" style={{ padding: '10mm' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '8mm',
          borderBottom: '2px solid #3b82f6',
          paddingBottom: '4mm'
        }}>
          <h1 style={{ 
            fontSize: '24pt', 
            fontWeight: 700, 
            color: '#1e40af',
            margin: '0 0 2mm'
          }}>
            Fan Zone Running Order
          </h1>
          <p style={{ fontSize: '14pt', color: '#64748b', margin: 0 }}>
            Non-Matchdays Schedule • AFCON 2025 Morocco
          </p>
        </div>

        {/* Stats */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '4mm',
          marginBottom: '6mm'
        }}>
          <p style={{ margin: '0 0 4mm', fontWeight: 500 }}>
            {schedule.items.length} Items
          </p>
        </div>

        {/* Content */}
        <div style={{ paddingTop: '8mm' }}>
          {sortedItems.map((item) => {
            const idx = getTimeColorIndex(item.time)
            const palette = getCategoryPaletteEntry(idx)
            
            return (
              <div
                key={item.id}
                className="running-order-card"
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  marginBottom: '5mm',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  display: 'flex'
                }}
              >
                {/* Time Badge */}
                <div
                  style={{
                    background: palette.bannerFrom,
                    color: 'white',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '70px'
                  }}
                >
                  <span style={{ fontSize: '14pt', fontWeight: 700 }}>{item.time || '--:--'}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '12px 16px' }}>
                  {/* Title */}
                  <div style={{
                    display: 'inline-block',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    marginBottom: '12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ fontSize: '12pt', fontWeight: 600, color: '#1e293b' }}>
                      {item.title || 'Untitled'}
                    </span>
                  </div>

                  {/* Screens */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: '4px' }}>Screen 1</div>
                      <div style={{ fontSize: '10pt', fontWeight: 500, color: '#334155' }}>
                        {item.screens.screen1 || '-'}
                      </div>
                    </div>
                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: '4px' }}>Screen 2</div>
                      <div style={{ fontSize: '10pt', fontWeight: 500, color: '#334155' }}>
                        {item.screens.screen2 || '-'}
                      </div>
                    </div>
                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: '4px' }}>Screen 3</div>
                      <div style={{ fontSize: '10pt', fontWeight: 500, color: '#334155' }}>
                        {item.screens.screen3 || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
