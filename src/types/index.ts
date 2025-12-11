export interface Competition {
  // Competition names (Language 1 & 2)
  name1: string
  name2: string
  // Optional legacy single-name field kept for backwards compatibility
  name?: string
  // Core dates
  startDate: string
  endDate: string
  // Competition logo (preferred)
  logoDataUrl: string
  // Stadiums and teams participating in the competition
  stadiums: Stadium[]
  teams: Team[]
  // Existing branding block kept and extended for backwards compatibility
  branding: {
    // Legacy logo field – kept in sync with logoDataUrl
    logo: string
    primaryColor: string
    secondaryColor: string
  }
}

export interface Stadium {
  id: string
  name1: string
  name2: string
  city1: string
  city2: string
}

export interface Team {
  id: string
  name1: string
  name2: string
}

export interface RunningOrderItem {
  id: string
  // Time offset string (e.g. "-00:30:00", "+00:10:00", "HT+00:05")
  time: string

  // Titles & descriptions
  title: string // Title (Language 1)
  description1: string // Description (Language 1)

  // Core element properties
  materialType: 'Video' | 'Audio' | 'Other'
  audio: boolean
  responsible: string
  loop: boolean

  // Scripts (Language 1 & 2)
  script1: string
  script2: string

  // Existing properties kept for backwards compatibility and meta information
  giantScreen: string
  pitchLed: string
  ledRing: string
  ringLed?: string // optional alias for ledRing
  lights: string
  duration: string
  notes: string
  graphicsProduced?: string
  // Legacy single audio option label – kept for backwards compatibility
  audioOption: string
  // One or more concrete audio sources (e.g. "MC Audio", "DJ")
  audioSources: string[]
  videoType: string
  // Whether the item is active (included) or temporarily deactivated
  active: boolean

  // Category/group this item belongs to
  category: string
}

export interface RunningOrderCategory {
  id: string
  name: string
  items: RunningOrderItem[]
}

export interface MatchConfig {
  teamAId: string
  teamBId: string
  stadiumId: string
  matchTime: string
  extraNotes: string
  useGenericTeams?: boolean
}

export interface AppData {
  competition: Competition
  runningOrder: RunningOrderItem[]
  categories: RunningOrderCategory[]
  selectedVenue: string
  matchConfig: MatchConfig
  dataVersion?: number
}

export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}
