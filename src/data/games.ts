export interface Game {
  id: string
  matchNumber: number
  stage: 'GROUP_STAGE' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL'
  teamA: string
  teamB: string
  date: string
  time: string
  stadium: string
  city: string
  // Admin-editable fields (stored in Supabase)
  influencers?: string[]
  legends?: string[]
  playersToWatch?: string[]
}

export const games: Game[] = [
  // GROUP STAGE
  { id: 'gs-1', matchNumber: 1, stage: 'GROUP_STAGE', teamA: 'Morocco', teamB: 'Comoros', date: 'Sunday 21 December', time: '20:00', stadium: 'Prince Moulay Abdellah Stadium', city: 'Rabat' },
  { id: 'gs-2', matchNumber: 2, stage: 'GROUP_STAGE', teamA: 'Mali', teamB: 'Zambia', date: 'Monday 22 December', time: '15:00', stadium: 'Mohammed V Stadium', city: 'Casablanca' },
  { id: 'gs-3', matchNumber: 3, stage: 'GROUP_STAGE', teamA: 'South Africa', teamB: 'Angola', date: 'Monday 22 December', time: '18:00', stadium: 'Marrakech Grand Stadium', city: 'Marrakech' },
  { id: 'gs-4', matchNumber: 4, stage: 'GROUP_STAGE', teamA: 'Egypt', teamB: 'Zimbabwe', date: 'Monday 22 December', time: '21:00', stadium: 'Adrar Stadium', city: 'Agadir' },
  { id: 'gs-5', matchNumber: 5, stage: 'GROUP_STAGE', teamA: 'DR Congo', teamB: 'Benin', date: 'Tuesday 23 December', time: '13:30', stadium: 'El Barid Stadium', city: 'Rabat' },
  { id: 'gs-6', matchNumber: 6, stage: 'GROUP_STAGE', teamA: 'Senegal', teamB: 'Botswana', date: 'Tuesday 23 December', time: '16:00', stadium: 'Tangier Grand Stadium', city: 'Tangier' },
  { id: 'gs-7', matchNumber: 7, stage: 'GROUP_STAGE', teamA: 'Nigeria', teamB: 'Tanzania', date: 'Tuesday 23 December', time: '18:30', stadium: 'Fes Sports Complex Stadium', city: 'Fez' },
  { id: 'gs-8', matchNumber: 8, stage: 'GROUP_STAGE', teamA: 'Tunisia', teamB: 'Uganda', date: 'Tuesday 23 December', time: '21:00', stadium: 'Prince Moulay Abdellah Olympic Annex Stadium', city: 'Rabat' },
  { id: 'gs-9', matchNumber: 9, stage: 'GROUP_STAGE', teamA: 'Burkina Faso', teamB: 'Equatorial Guinea', date: 'Wednesday 24 December', time: '13:30', stadium: 'Mohammed V Stadium', city: 'Casablanca' },
  { id: 'gs-10', matchNumber: 10, stage: 'GROUP_STAGE', teamA: 'Algeria', teamB: 'Sudan', date: 'Wednesday 24 December', time: '16:00', stadium: 'Prince Moulay El Hassan Stadium', city: 'Rabat' },
  { id: 'gs-11', matchNumber: 11, stage: 'GROUP_STAGE', teamA: "Cote d'Ivoire", teamB: 'Mozambique', date: 'Wednesday 24 December', time: '18:30', stadium: 'Marrakech Grand Stadium', city: 'Marrakech' },
  { id: 'gs-12', matchNumber: 12, stage: 'GROUP_STAGE', teamA: 'Cameroon', teamB: 'Gabon', date: 'Wednesday 24 December', time: '16:00', stadium: 'Adrar Stadium', city: 'Agadir' },
  { id: 'gs-13', matchNumber: 13, stage: 'GROUP_STAGE', teamA: 'Angola', teamB: 'Zimbabwe', date: 'Friday 26 December', time: '13:30', stadium: 'Marrakech Grand Stadium', city: 'Marrakech' },
  { id: 'gs-14', matchNumber: 14, stage: 'GROUP_STAGE', teamA: 'Egypt', teamB: 'South Africa', date: 'Friday 26 December', time: '16:00', stadium: 'Adrar Stadium', city: 'Agadir' },
  { id: 'gs-15', matchNumber: 15, stage: 'GROUP_STAGE', teamA: 'Zambia', teamB: 'Comoros', date: 'Friday 26 December', time: '18:30', stadium: 'Mohammed V Stadium', city: 'Casablanca' },
  { id: 'gs-16', matchNumber: 16, stage: 'GROUP_STAGE', teamA: 'Morocco', teamB: 'Mali', date: 'Friday 26 December', time: '21:00', stadium: 'Prince Moulay Abdellah Stadium', city: 'Rabat' },
  { id: 'gs-17', matchNumber: 17, stage: 'GROUP_STAGE', teamA: 'Benin', teamB: 'Botswana', date: 'Saturday 27 December', time: '13:30', stadium: 'Prince Moulay Abdellah Olympic Stadium', city: 'Rabat' },
  { id: 'gs-18', matchNumber: 18, stage: 'GROUP_STAGE', teamA: 'Senegal', teamB: 'DR Congo', date: 'Saturday 27 December', time: '16:00', stadium: 'Tangier Grand Stadium', city: 'Tangier' },
  { id: 'gs-19', matchNumber: 19, stage: 'GROUP_STAGE', teamA: 'Uganda', teamB: 'Tanzania', date: 'Saturday 27 December', time: '18:30', stadium: 'El Barid Stadium', city: 'Rabat' },
  { id: 'gs-20', matchNumber: 20, stage: 'GROUP_STAGE', teamA: 'Nigeria', teamB: 'Tunisia', date: 'Saturday 27 December', time: '21:00', stadium: 'Fes Sports Complex Stadium', city: 'Fez' },
  { id: 'gs-21', matchNumber: 21, stage: 'GROUP_STAGE', teamA: 'Gabon', teamB: 'Mozambique', date: 'Sunday 28 December', time: '13:30', stadium: 'Adrar Stadium', city: 'Agadir' },
  { id: 'gs-22', matchNumber: 22, stage: 'GROUP_STAGE', teamA: 'Equatorial Guinea', teamB: 'Sudan', date: 'Sunday 28 December', time: '16:00', stadium: 'Mohammed V Stadium', city: 'Casablanca' },
  { id: 'gs-23', matchNumber: 23, stage: 'GROUP_STAGE', teamA: 'Algeria', teamB: 'Burkina Faso', date: 'Sunday 28 December', time: '18:30', stadium: 'Prince Moulay El Hassan Stadium', city: 'Rabat' },
  { id: 'gs-24', matchNumber: 24, stage: 'GROUP_STAGE', teamA: "Cote d'Ivoire", teamB: 'Cameroon', date: 'Sunday 28 December', time: '21:00', stadium: 'Marrakech Grand Stadium', city: 'Marrakech' },
  { id: 'gs-25', matchNumber: 25, stage: 'GROUP_STAGE', teamA: 'Angola', teamB: 'Egypt', date: 'Monday 29 December', time: '17:00', stadium: 'Adrar Stadium', city: 'Agadir' },
  { id: 'gs-26', matchNumber: 26, stage: 'GROUP_STAGE', teamA: 'Zimbabwe', teamB: 'South Africa', date: 'Monday 29 December', time: '17:00', stadium: 'Marrakech Grand Stadium', city: 'Marrakech' },
  { id: 'gs-27', matchNumber: 27, stage: 'GROUP_STAGE', teamA: 'Zambia', teamB: 'Morocco', date: 'Monday 29 December', time: '20:00', stadium: 'Prince Moulay Abdellah Stadium', city: 'Rabat' },
  { id: 'gs-28', matchNumber: 28, stage: 'GROUP_STAGE', teamA: 'Comoros', teamB: 'Mali', date: 'Monday 29 December', time: '20:00', stadium: 'Mohammed V Stadium', city: 'Casablanca' },
  { id: 'gs-29', matchNumber: 29, stage: 'GROUP_STAGE', teamA: 'Uganda', teamB: 'Nigeria', date: 'Tuesday 30 December', time: '17:00', stadium: 'Fes Sports Complex Stadium', city: 'Fez' },
  { id: 'gs-30', matchNumber: 30, stage: 'GROUP_STAGE', teamA: 'Tanzania', teamB: 'Tunisia', date: 'Tuesday 30 December', time: '17:00', stadium: 'Prince Moulay Abdellah Olympic Annex Stadium', city: 'Rabat' },
  { id: 'gs-31', matchNumber: 31, stage: 'GROUP_STAGE', teamA: 'Benin', teamB: 'Senegal', date: 'Tuesday 30 December', time: '20:00', stadium: 'Tangier Grand Stadium', city: 'Tangier' },
  { id: 'gs-32', matchNumber: 32, stage: 'GROUP_STAGE', teamA: 'Botswana', teamB: 'DR Congo', date: 'Tuesday 30 December', time: '20:00', stadium: 'El Barid Stadium', city: 'Rabat' },
  { id: 'gs-33', matchNumber: 33, stage: 'GROUP_STAGE', teamA: 'Equatorial Guinea', teamB: 'Algeria', date: 'Wednesday 31 December', time: '17:00', stadium: 'Prince Moulay El Hassan Stadium', city: 'Rabat' },
  { id: 'gs-34', matchNumber: 34, stage: 'GROUP_STAGE', teamA: 'Sudan', teamB: 'Burkina Faso', date: 'Wednesday 31 December', time: '17:00', stadium: 'Mohammed V Stadium', city: 'Casablanca' },
  { id: 'gs-35', matchNumber: 35, stage: 'GROUP_STAGE', teamA: 'Gabon', teamB: "Cote d'Ivoire", date: 'Wednesday 31 December', time: '20:00', stadium: 'Marrakech Grand Stadium', city: 'Marrakech' },
  { id: 'gs-36', matchNumber: 36, stage: 'GROUP_STAGE', teamA: 'Mozambique', teamB: 'Cameroon', date: 'Wednesday 31 December', time: '20:00', stadium: 'Adrar Stadium', city: 'Agadir' },

  // ROUND OF 16
  { id: 'r16-1', matchNumber: 37, stage: 'ROUND_OF_16', teamA: '1D', teamB: '3B/E/F', date: 'Saturday 3 January', time: '17:00', stadium: 'Tangier Grand Stadium', city: 'Tangier' },
  { id: 'r16-2', matchNumber: 38, stage: 'ROUND_OF_16', teamA: '2A', teamB: '2C', date: 'Saturday 3 January', time: '20:00', stadium: 'Mohammed V Stadium', city: 'Casablanca' },
  { id: 'r16-3', matchNumber: 39, stage: 'ROUND_OF_16', teamA: '1A', teamB: '3C/D/E', date: 'Sunday 4 January', time: '17:00', stadium: 'Prince Moulay Abdellah Stadium', city: 'Rabat' },
  { id: 'r16-4', matchNumber: 40, stage: 'ROUND_OF_16', teamA: '2B', teamB: '2F', date: 'Sunday 4 January', time: '20:00', stadium: 'El Barid Stadium', city: 'Rabat' },
  { id: 'r16-5', matchNumber: 41, stage: 'ROUND_OF_16', teamA: '1B', teamB: '3A/C/D', date: 'Monday 5 January', time: '17:00', stadium: 'Adrar Stadium', city: 'Agadir' },
  { id: 'r16-6', matchNumber: 42, stage: 'ROUND_OF_16', teamA: '1C', teamB: '3A/B/F', date: 'Monday 5 January', time: '20:00', stadium: 'Fes Sports Complex Stadium', city: 'Fez' },
  { id: 'r16-7', matchNumber: 43, stage: 'ROUND_OF_16', teamA: '1E', teamB: '2D', date: 'Tuesday 6 January', time: '17:00', stadium: 'Prince Moulay El Hassan Stadium', city: 'Rabat' },
  { id: 'r16-8', matchNumber: 44, stage: 'ROUND_OF_16', teamA: '1F', teamB: '2E', date: 'Tuesday 6 January', time: '20:00', stadium: 'Marrakech Grand Stadium', city: 'Marrakech' },

  // QUARTER FINAL
  { id: 'qf-1', matchNumber: 45, stage: 'QUARTER_FINAL', teamA: 'W38', teamB: 'W37', date: 'Friday 9 January', time: '17:00', stadium: 'Tangier Grand Stadium', city: 'Tangier' },
  { id: 'qf-2', matchNumber: 46, stage: 'QUARTER_FINAL', teamA: 'W40', teamB: 'W39', date: 'Friday 9 January', time: '20:00', stadium: 'Prince Moulay Abdellah Stadium', city: 'Rabat' },
  { id: 'qf-3', matchNumber: 47, stage: 'QUARTER_FINAL', teamA: 'W43', teamB: 'W42', date: 'Saturday 10 January', time: '17:00', stadium: 'Adrar Stadium', city: 'Agadir' },
  { id: 'qf-4', matchNumber: 48, stage: 'QUARTER_FINAL', teamA: 'W41', teamB: 'W44', date: 'Saturday 10 January', time: '20:00', stadium: 'Marrakech Grand Stadium', city: 'Marrakech' },

  // SEMI FINAL
  { id: 'sf-1', matchNumber: 49, stage: 'SEMI_FINAL', teamA: 'W45', teamB: 'W48', date: 'Wednesday 14 January', time: '18:00', stadium: 'Prince Moulay Abdellah Stadium', city: 'Rabat' },
  { id: 'sf-2', matchNumber: 50, stage: 'SEMI_FINAL', teamA: 'W47', teamB: 'W46', date: 'Wednesday 14 January', time: '21:00', stadium: 'Tangier Grand Stadium', city: 'Tangier' },

  // 3RD PLACE
  { id: '3rd', matchNumber: 51, stage: 'THIRD_PLACE', teamA: 'L49', teamB: 'L50', date: 'Saturday 17 January', time: '17:00', stadium: 'Mohammed V Stadium', city: 'Casablanca' },

  // FINAL
  { id: 'final', matchNumber: 52, stage: 'FINAL', teamA: 'W49', teamB: 'W50', date: 'Sunday 18 January', time: '20:00', stadium: 'Prince Moulay Abdellah Stadium', city: 'Rabat' },
]

export const stageLabels: Record<Game['stage'], string> = {
  GROUP_STAGE: 'Group Stage',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter Final',
  SEMI_FINAL: 'Semi Final',
  THIRD_PLACE: '3rd Place',
  FINAL: 'Final'
}

export function getGameById(id: string): Game | undefined {
  return games.find(g => g.id === id)
}

export function getGamesByStage(stage: Game['stage']): Game[] {
  return games.filter(g => g.stage === stage)
}

export function getGamesByDate(date: string): Game[] {
  return games.filter(g => g.date === date)
}
