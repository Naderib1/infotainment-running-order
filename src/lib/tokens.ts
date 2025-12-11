export interface TokenContext {
  competition1: string
  competition2: string
  stadium1: string
  stadium2: string
  city1: string
  city2: string
  teamA1: string
  teamA2: string
  teamB1: string
  teamB2: string
  matchTime: string
}

export function applyTokens(text: string, context: TokenContext): string {
  if (!text) return ''

  const map: Record<string, string> = {
    // Core 1/2 tokens
    Competition1: context.competition1,
    Competition2: context.competition2,
    Stadium1: context.stadium1,
    Stadium2: context.stadium2,
    City1: context.city1,
    City2: context.city2,
    TeamA1: context.teamA1,
    TeamA2: context.teamA2,
    TeamB1: context.teamB1,
    TeamB2: context.teamB2,
    MatchTime: context.matchTime,
    // Language-suffix variants (L1 = primary, L2 = secondary)
    'Competition-L1': context.competition1,
    'Competition-L2': context.competition2,
    'Stadium-L1': context.stadium1,
    'Stadium-L2': context.stadium2,
    'City-L1': context.city1,
    'City-L2': context.city2,
    'TeamA-L1': context.teamA1,
    'TeamA-L2': context.teamA2,
    'TeamB-L1': context.teamB1,
    'TeamB-L2': context.teamB2,
    // Legacy aliases (Language 1)
    Competition: context.competition1,
    Stadium: context.stadium1,
    City: context.city1,
    TeamA: context.teamA1,
    TeamB: context.teamB1
  }

  let result = text

  Object.entries(map).forEach(([token, value]) => {
    const safeValue = value ?? ''
    if (!safeValue) {
      // Leave token as-is if no value – easier to debug missing data
      return
    }
    const pattern = new RegExp(`\\[${token}\\]`, 'g')
    result = result.replace(pattern, safeValue)
  })

  return result
}
