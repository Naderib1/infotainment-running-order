import {
  AppData,
  Competition,
  MatchConfig,
  RunningOrderCategory,
  RunningOrderItem,
  Stadium,
  Team
} from '@/types'
import { defaultCategories, defaultStadiums, defaultTeams } from '@/data/defaultCategories'

const AFCON_COMPETITION_NAME =
  'TotalEnergies CAF Africa Cup of Nations, Morocco 2025'

const AFCON_LOGO_URL =
  'https://upload.wikimedia.org/wikipedia/en/thumb/8/85/2025_Africa_Cup_of_Nations_logo.svg/500px-2025_Africa_Cup_of_Nations_logo.svg.png'

function ensureStadium(stadium: any, fallbackId: number): Stadium {
  if (!stadium) {
    return defaultStadiums[Math.min(fallbackId, defaultStadiums.length - 1)]
  }

  const base: Stadium = {
    id: String(stadium.id ?? `stadium-${fallbackId + 1}`),
    name1: String(stadium.name1 ?? stadium.name ?? ''),
    name2: String(stadium.name2 ?? stadium.name1 ?? stadium.name ?? ''),
    city1: String(stadium.city1 ?? stadium.city ?? ''),
    city2: String(stadium.city2 ?? stadium.city1 ?? stadium.city ?? '')
  }

  // If this matches one of our AFCON 2025 venues, snap to the canonical
  // Arabic (L1) / English (L2) naming so that old English-only data upgrades.
  const matchById = defaultStadiums.find(s => s.id === base.id)
  const matchByName =
    defaultStadiums.find(
      s =>
        s.name2 === stadium.name ||
        s.name2 === stadium.name1 ||
        s.name2 === stadium.name2
    ) ?? matchById

  if (matchByName) {
    return {
      ...base,
      name1: matchByName.name1,
      name2: matchByName.name2,
      city1: matchByName.city1,
      city2: matchByName.city2
    }
  }

  return base
}

function ensureTeam(team: any, fallbackId: number): Team {
  if (!team) {
    return defaultTeams[Math.min(fallbackId, defaultTeams.length - 1)]
  }

  const name =
    typeof team === 'string'
      ? team
      : String(team.name1 ?? team.name2 ?? team.name ?? '')

  const base: Team = {
    id: String(team.id ?? `team-${fallbackId + 1}`),
    name1: name,
    name2: String(team.name2 ?? name)
  }

  // Upgrade to AFCON 2025 canonical names if we recognise this team.
  const match =
    defaultTeams.find(t => t.id === base.id) ||
    defaultTeams.find(
      t =>
        t.name2 === name ||
        t.name1 === name ||
        t.name2 === team.name2
    )

  if (match) {
    return {
      ...base,
      name1: match.name1,
      name2: match.name2
    }
  }

  return base
}

function ensureCompetition(raw: any): Competition {
  const c = raw ?? {}

  // Stadiums: prefer new stadiums array, then legacy venues, then AFCON defaults
  let stadiums: Stadium[]
  if (Array.isArray(c.stadiums) && c.stadiums.length > 0) {
    stadiums = c.stadiums.map(ensureStadium)
  } else if (Array.isArray(c.venues) && c.venues.length > 0) {
    stadiums = c.venues.map((v: any, index: number) =>
      ensureStadium(
        {
          id: v.id,
          name1: v.name,
          city1: v.city
        },
        index
      )
    )
  } else {
    stadiums = defaultStadiums
  }

  // Teams: if none stored, fall back to AFCON teams. Otherwise normalise and
  // upgrade names where possible.
  const teams: Team[] =
    Array.isArray(c.teams) && c.teams.length > 0
      ? c.teams.map(ensureTeam)
      : defaultTeams

  const name1: string = String(
    c.name1 ?? c.name ?? AFCON_COMPETITION_NAME
  )

  // Dates: keep existing values if present; otherwise, default to the
  // AFCON 2025 tournament range so new users always see a realistic
  // pre-filled period. This runs through the migration layer, so it
  // also upgrades older saved data that had empty dates.
  let startDate = String(c.startDate ?? '')
  let endDate = String(c.endDate ?? '')

  if (!startDate) {
    startDate = '2025-12-21T00:00:00.000Z'
  }

  if (!endDate) {
    endDate = '2026-01-18T00:00:00.000Z'
  }

  const logoDataUrl: string = String(
    c.logoDataUrl ?? c.branding?.logo ?? AFCON_LOGO_URL
  )

  const branding = {
    logo: String(c.branding?.logo ?? logoDataUrl),
    primaryColor: String(c.branding?.primaryColor ?? '#8D0000'),
    secondaryColor: String(c.branding?.secondaryColor ?? '#B50000')
  }

  return {
    name1,
    name2: String(c.name2 ?? name1),
    name: c.name ?? name1,
    startDate,
    endDate,
    logoDataUrl,
    stadiums,
    teams,
    branding
  }
}

function ensureRunningOrderItem(raw: any, index: number): RunningOrderItem {
  const item = raw ?? {}

  const time = String(item.time ?? '')
  const title = String(item.title ?? '')

  const description1 = String(
    item.description1 ?? item.notes ?? ''
  )

  const script1 = String(
    item.script1 ?? item.script ?? ''
  )

  const script2 = String(item.script2 ?? '')

  const materialType: RunningOrderItem['materialType'] =
    item.materialType === 'Audio' ||
    item.materialType === 'Video' ||
    item.materialType === 'Other'
      ? item.materialType
      : // Basic heuristic to infer material type from existing fields
        item.audioOption === 'Audio'
        ? 'Audio'
        : item.videoType
        ? 'Video'
        : 'Other'

  // Normalise audio sources. New model prefers an explicit array, but we
  // gracefully upgrade legacy single-value audioOption / boolean audio.
  let audioSources: string[] = Array.isArray(item.audioSources)
    ? item.audioSources.map((s: any) => String(s)).filter(Boolean)
    : []

  if (audioSources.length === 0 && typeof item.audioOption === 'string') {
    const option = String(item.audioOption).trim()
    if (option && option.toLowerCase() !== 'no audio') {
      audioSources = option
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    }
  }

  // If we still don't have explicit sources but audio was truthy, fall back
  // to a generic label so the PDF and UI still show something meaningful.
  if (audioSources.length === 0 && item.audio === true) {
    audioSources = ['Audio']
  }

  const audio =
    typeof item.audio === 'boolean'
      ? item.audio
      : audioSources.length > 0 ||
        item.audioOption === 'Audio' ||
        item.audioOption === 'With audio'

  const loop =
    typeof item.loop === 'boolean'
      ? item.loop
      : item.videoType === 'Loop'

  return {
    id: String(item.id ?? `item-${index + 1}`),
    time,
    title,
    description1,
    materialType,
    audio,
    responsible: String(item.responsible ?? ''),
    loop,
    script1,
    script2,
    giantScreen: String(item.giantScreen ?? ''),
    pitchLed: String(item.pitchLed ?? ''),
    ledRing: String(item.ledRing ?? item.ringLed ?? ''),
    ringLed: String(item.ringLed ?? item.ledRing ?? ''),
    graphicsProduced: String(item.graphicsProduced ?? ''),
    lights: String(item.lights ?? ''),
    duration: String(item.duration ?? ''),
    notes: String(item.notes ?? ''),
    audioOption: String(
      item.audioOption ??
        (audioSources.length > 0
          ? audioSources.join(', ')
          : audio
          ? 'With audio'
          : 'No audio')
    ),
    audioSources,
    videoType: String(item.videoType ?? (loop ? 'Loop' : 'One Play')),
    category: String(item.category ?? ''),
    active: typeof item.active === 'boolean' ? item.active : true
  }
}

function ensureCategory(
  raw: any,
  itemStartIndex: number
): RunningOrderCategory {
  const category = raw ?? {}
  const itemsArray: any[] = Array.isArray(category.items)
    ? category.items
    : []

  return {
    id: String(category.id ?? ''),
    name: String(category.name ?? ''),
    items: itemsArray.map((item, idx) =>
      ensureRunningOrderItem(item, itemStartIndex + idx)
    )
  }
}

function ensureMatchConfig(raw: any): MatchConfig {
  const cfg = raw ?? {}
  return {
    teamAId: String(cfg.teamAId ?? ''),
    teamBId: String(cfg.teamBId ?? ''),
    stadiumId: String(cfg.stadiumId ?? ''),
    matchTime: String(cfg.matchTime ?? ''),
    extraNotes: String(cfg.extraNotes ?? ''),
    useGenericTeams: Boolean(cfg.useGenericTeams)
  }
}

export function ensureAppDataShape(raw: any): AppData {
  const value = raw ?? {}
  const previousVersion = typeof value.dataVersion === 'number' ? value.dataVersion : 1

  const competition = ensureCompetition(value.competition)

  const runningOrder: RunningOrderItem[] = Array.isArray(
    value.runningOrder
  )
    ? value.runningOrder.map(ensureRunningOrderItem)
    : []

  const categories: RunningOrderCategory[] = Array.isArray(
    value.categories
  )
    ? value.categories.map((c: any, idx: number) =>
        ensureCategory(c, idx * 1000)
      )
    : defaultCategories

  const selectedVenue = String(value.selectedVenue ?? '')

  const matchConfig = ensureMatchConfig(value.matchConfig)

  // Versioned migration:
  // v1 → v2 : snap stadiums & teams to AFCON 2025 canonical data once,
  //           then mark dataVersion = 2 so we do not overwrite user edits later.
  if (previousVersion < 2) {
    competition.stadiums = defaultStadiums
    competition.teams = defaultTeams
  }

  return {
    competition,
    runningOrder,
    categories,
    selectedVenue,
    matchConfig,
    dataVersion: 2
  }
}
