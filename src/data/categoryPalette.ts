export interface CategoryPaletteEntry {
  borderClass: string
  textClass: string
  timeClass: string
  bannerFrom: string
  bannerTo: string
}

const entries: CategoryPaletteEntry[] = [
  {
    borderClass: 'border-pink-500',
    textClass: 'text-pink-700',
    timeClass: 'bg-pink-500',
    bannerFrom: '#f472b6',
    bannerTo: '#db2777'
  },
  {
    borderClass: 'border-blue-500',
    textClass: 'text-blue-700',
    timeClass: 'bg-blue-600',
    bannerFrom: '#60a5fa',
    bannerTo: '#2563eb'
  },
  {
    borderClass: 'border-purple-500',
    textClass: 'text-purple-700',
    timeClass: 'bg-purple-500',
    bannerFrom: '#c084fc',
    bannerTo: '#7c3aed'
  },
  {
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-700',
    timeClass: 'bg-emerald-500',
    bannerFrom: '#6ee7b7',
    bannerTo: '#10b981'
  },
  {
    borderClass: 'border-orange-500',
    textClass: 'text-orange-700',
    timeClass: 'bg-orange-500',
    bannerFrom: '#fb923c',
    bannerTo: '#f97316'
  },
  {
    borderClass: 'border-amber-500',
    textClass: 'text-amber-700',
    timeClass: 'bg-amber-500',
    bannerFrom: '#fcd34d',
    bannerTo: '#f59e0b'
  },
  {
    borderClass: 'border-fuchsia-500',
    textClass: 'text-fuchsia-700',
    timeClass: 'bg-fuchsia-500',
    bannerFrom: '#f0abfc',
    bannerTo: '#d946ef'
  },
  {
    borderClass: 'border-indigo-500',
    textClass: 'text-indigo-700',
    timeClass: 'bg-indigo-600',
    bannerFrom: '#a5b4fc',
    bannerTo: '#6366f1'
  }
]

export const getCategoryPaletteEntry = (index: number): CategoryPaletteEntry => {
  if (index < 0) return entries[0]
  return entries[index % entries.length]
}
