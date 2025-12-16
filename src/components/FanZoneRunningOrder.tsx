import { useMemo, useRef } from 'react'
import { ChevronLeft, FileText, Download, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { 
  FanZoneSchedule, 
  FanZoneItem, 
  defaultFanZoneSchedule 
} from '../data/fanZoneSchedule'
import { downloadFile } from '../lib/utils'
import { getCategoryPaletteEntry } from '../data/categoryPalette'

interface FanZoneRunningOrderProps {
  schedule?: FanZoneSchedule
  onBack: () => void
}

// Map fan zone types to category indices for consistent palette
const typeToIndex: Record<FanZoneItem['type'], number> = {
  opening: 0,
  music: 1,
  match: 2,
  entertainment: 3,
  closing: 4
}

// Parse time string to minutes for sorting
const parseTime = (timeStr: string): number => {
  if (!timeStr) return 9999
  const [hours, minutes] = timeStr.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

export function FanZoneRunningOrder({ schedule = defaultFanZoneSchedule, onBack }: FanZoneRunningOrderProps) {
  const pdfContentRef = useRef<HTMLDivElement>(null)
  
  // Sort all items by time
  const sortedItems = useMemo(() => {
    return [...schedule.items].sort((a, b) => parseTime(a.time) - parseTime(b.time))
  }, [schedule.items])

  const handlePrintView = () => {
    if (typeof window === 'undefined') return
    document.body.classList.add('print-running-order')
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('print-running-order')
    }, { once: true })
    window.print()
  }

  const exportToHTML = () => {
    if (!pdfContentRef.current) return
    const exportMarkup = pdfContentRef.current.innerHTML
    const css = `:root { color-scheme: light; }
* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; background: #fff; color: #0f172a; }
.export-wrapper { max-width: 210mm; margin: 0 auto; }
.glass-card { background: rgba(255,255,255,0.95); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; }
.running-order-card { page-break-inside: avoid; margin-bottom: 5mm; }
@page { size: A4; margin: 10mm 8mm; }`
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Fan Zone Running Order - ${schedule.name}</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<style>${css}</style>
</head>
<body>
<div class="export-wrapper">${exportMarkup}</div>
</body>
</html>`
    const filename = `Fan Zone Running Order - ${schedule.name}.html`
    downloadFile(html, filename, 'text/html')
  }

  const coverPrimary = '#7c3aed'
  const coverSecondary = '#db2777'

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
            Back to Platform
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
              minHeight: '280px',
              padding: '48px'
            }}
          >
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/15 blur-3xl" />
              <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
            </div>
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between h-full">
              <div className="flex items-center gap-8">
                {/* Logo */}
                <div className="bg-white/15 rounded-3xl p-5 backdrop-blur shadow-lg">
                  <Users className="h-32 w-auto text-white" />
                </div>
                {/* Title */}
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-white/70 mb-2">
                    Fan Zone Running Order
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {schedule.name}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mt-2 font-medium">
                    TotalEnergies CAF Africa Cup of Nations, Morocco 2025
                  </p>
                </div>
              </div>
              {/* Info */}
              <div className="flex flex-col gap-3 self-end">
                <div className="bg-white/20 rounded-2xl px-6 py-4 backdrop-blur text-center">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/70 mb-1">Total Items</div>
                  <div className="text-2xl font-bold">{schedule.items.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Running Order Items - flat list sorted by time */}
        <div className="space-y-4">
          {sortedItems.map((item) => {
            const idx = typeToIndex[item.type]
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
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {item.time || '--:--'}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 mr-4">
                          <div className="inline-block bg-white shadow-md border border-slate-200 px-4 py-2 rounded-full">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {item.title || 'Untitled'}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* 3 Columns Grid: On-Ground / Screens / Audio */}
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        {/* On-Ground */}
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg">
                          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 tracking-wide">
                            On-Ground
                          </div>
                          <div className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-line">
                            {item.screens.screen1}
                          </div>
                        </div>

                        {/* Screens */}
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg">
                          <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-1 tracking-wide">
                            Screens
                          </div>
                          <div className="text-xs text-purple-800 dark:text-purple-200 whitespace-pre-line">
                            {item.screens.screen2}
                          </div>
                        </div>

                        {/* Audio */}
                        <div className="bg-pink-100 dark:bg-pink-900/30 p-2.5 rounded-lg">
                          <div className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase mb-1 tracking-wide">
                            Audio
                          </div>
                          <div className="text-xs text-pink-800 dark:text-pink-200 whitespace-pre-line">
                            {item.screens.screen3}
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
      {/* Cover Page */}
      <div
        className="cover-page"
        data-export="cover-page"
        style={{
          width: '210mm',
          height: '297mm',
          maxHeight: '297mm',
          background: `linear-gradient(135deg, ${coverPrimary}, ${coverSecondary})`,
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
        {/* Fan Zone Icon */}
        <div style={{
          width: '100mm',
          height: '100mm',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '15mm',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '24px'
        }}>
          <Users style={{ width: '60mm', height: '60mm', color: 'white' }} />
        </div>
        
        {/* Fan Zone Running Order text */}
        <p style={{ 
          letterSpacing: '0.4em', 
          textTransform: 'uppercase', 
          fontSize: '14pt', 
          opacity: 0.9, 
          margin: '0 0 12mm', 
          fontWeight: 500,
          textAlign: 'center'
        }}>
          Fan Zone Running Order
        </p>
        
        {/* Schedule Name */}
        <p style={{ 
          fontSize: '24pt', 
          fontWeight: 700, 
          margin: '0 0 8mm', 
          lineHeight: 1.3,
          textAlign: 'center'
        }}>
          {schedule.name}
        </p>
        
        {/* Competition Name */}
        <p style={{ 
          fontSize: '16pt', 
          fontWeight: 500,
          opacity: 0.9, 
          margin: '0 0 15mm', 
          lineHeight: 1.4,
          textAlign: 'center'
        }}>
          TotalEnergies CAF Africa Cup of Nations, Morocco 2025
        </p>
        
        {/* Stats */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '14pt', 
          opacity: 0.9,
          marginTop: '10mm'
        }}>
          <p style={{ margin: '0 0 4mm', fontWeight: 500 }}>
            {schedule.items.length} Items
          </p>
        </div>
      </div>

      {/* Content - Flat list sorted by time */}
      <div style={{ paddingTop: '8mm' }}>
        {sortedItems.map((item) => {
          const idx = typeToIndex[item.type]
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

                {/* 3 Columns Grid: On-Ground / Screens / Audio */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {/* On-Ground */}
                  <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ fontSize: '8pt', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.05em' }}>
                      On-Ground
                    </p>
                    <p style={{ fontSize: '10pt', color: '#1e40af', margin: 0, whiteSpace: 'pre-line' }}>
                      {item.screens.screen1}
                    </p>
                  </div>

                  {/* Screens */}
                  <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
                    <p style={{ fontSize: '8pt', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.05em' }}>
                      Screens
                    </p>
                    <p style={{ fontSize: '10pt', color: '#6b21a8', margin: 0, whiteSpace: 'pre-line' }}>
                      {item.screens.screen2}
                    </p>
                  </div>

                  {/* Audio */}
                  <div style={{ background: '#fce7f3', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
                    <p style={{ fontSize: '8pt', fontWeight: 700, color: '#db2777', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.05em' }}>
                      Audio
                    </p>
                    <p style={{ fontSize: '10pt', color: '#9d174d', margin: 0, whiteSpace: 'pre-line' }}>
                      {item.screens.screen3}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </>
  )
}
