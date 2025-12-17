// Fan Zone running order data structure
// This represents the daily schedule for fan zone screens

export type FanZoneItemType = 
  | 'opening'      // OUVERTURE
  | 'closing'      // FERMETURE
  | 'music'        // Fond musical / DJ
  | 'match'        // MATCH block
  | 'entertainment' // Troupe Artistique (Mi-Temps)

export interface FanZoneItem {
  id: string
  type: FanZoneItemType
  // Time for ordering (e.g. "14:00", "15:30")
  time: string
  // Title/label for this item
  title: string
  // Content for each column
  screens: {
    screen1: string  // On-Ground
    screen2: string  // Screens
    screen3: string  // Audio
  }
  // Optional notes
  notes?: string
}

export interface FanZoneSchedule {
  id: string
  name: string
  date?: string // Optional date if schedule is date-specific
  items: FanZoneItem[]
}

// Color mapping for item types
export const fanZoneItemColors: Record<FanZoneItemType, { bg: string; text: string; border: string }> = {
  opening: { 
    bg: 'bg-green-500', 
    text: 'text-white', 
    border: 'border-green-600' 
  },
  closing: { 
    bg: 'bg-green-500', 
    text: 'text-white', 
    border: 'border-green-600' 
  },
  music: { 
    bg: 'bg-purple-500', 
    text: 'text-white', 
    border: 'border-purple-600' 
  },
  match: { 
    bg: 'bg-blue-500', 
    text: 'text-white', 
    border: 'border-blue-600' 
  },
  entertainment: { 
    bg: 'bg-pink-400', 
    text: 'text-black', 
    border: 'border-pink-500' 
  }
}

// Label mapping for item types
export const fanZoneItemLabels: Record<FanZoneItemType, { en: string; fr: string }> = {
  opening: { en: 'Opening', fr: 'OUVERTURE' },
  closing: { en: 'Closing', fr: 'FERMETURE' },
  music: { en: 'Background Music', fr: 'Fond musical' },
  match: { en: 'Match', fr: 'MATCH' },
  entertainment: { en: 'Artistic Performance (Half-Time)', fr: 'Troupe Artistique (Mi-Temps)' }
}

// Default fan zone schedule template
export const defaultFanZoneSchedule: FanZoneSchedule = {
  id: 'default-fanzone',
  name: 'Fan Zone Daily Schedule',
  items: [
    {
      id: 'fz-1',
      type: 'opening',
      time: '-02:00:00',
      title: 'Fan Zone Opens',
      screens: {
        screen1: 'Gates open, security & vendors operational',
        screen2: 'AFCON Welcome Loop + Sponsors',
        screen3: 'Background music (low)'
      }
    },
    {
      id: 'fz-2',
      type: 'opening',
      time: '-01:45:00',
      title: 'Welcome Messages',
      screens: {
        screen1: 'Crowd entry management',
        screen2: 'Fan Zone rules + daily schedule',
        screen3: 'MC welcome'
      }
    },
    {
      id: 'fz-3',
      type: 'music',
      time: '-01:30:00',
      title: 'Atmosphere Build',
      screens: {
        screen1: 'Activations & photo zones open',
        screen2: 'AFCON generic visuals',
        screen3: 'DJ set (low–medium)'
      }
    },
    {
      id: 'fz-4',
      type: 'music',
      time: '-01:15:00',
      title: 'Pre-Match Loop',
      screens: {
        screen1: 'Free fan movement',
        screen2: 'Match promos + sponsor loops',
        screen3: 'DJ continuous'
      }
    },
    {
      id: 'fz-5',
      type: 'match',
      time: '-01:00:00',
      title: 'Match Card',
      screens: {
        screen1: 'Attention shifts to main screen',
        screen2: 'Teams vs Teams graphic',
        screen3: 'MC intro + DJ transition'
      }
    },
    {
      id: 'fz-6',
      type: 'match',
      time: '-00:45:00',
      title: 'Team Focus',
      screens: {
        screen1: 'Fans gather near screen',
        screen2: 'Team visuals / flags / key players',
        screen3: 'DJ medium energy'
      }
    },
    {
      id: 'fz-7',
      type: 'match',
      time: '-00:30:00',
      title: 'Countdown Phase',
      screens: {
        screen1: 'Reduce roaming, screen priority',
        screen2: '"Kick-Off In" graphics',
        screen3: 'DJ + MC hype'
      }
    },
    {
      id: 'fz-8',
      type: 'match',
      time: '-00:15:00',
      title: 'Final Build-Up',
      screens: {
        screen1: 'Stage clear, crowd focus',
        screen2: 'Countdown loop',
        screen3: 'DJ higher energy'
      }
    },
    {
      id: 'fz-9',
      type: 'match',
      time: '-00:05:00',
      title: 'Pre-Kick-Off Hold',
      screens: {
        screen1: 'Full screen priority',
        screen2: 'AFCON bumper / static countdown',
        screen3: 'Audio fade'
      }
    },
    {
      id: 'fz-10',
      type: 'match',
      time: '00:00:00',
      title: 'Match – First Half',
      screens: {
        screen1: 'Crowd viewing, no interruptions',
        screen2: 'Live match feed',
        screen3: 'Match audio priority'
      }
    },
    {
      id: 'fz-11',
      type: 'entertainment',
      time: '+00:45:00',
      title: 'Halftime Transition',
      screens: {
        screen1: 'Stage reset',
        screen2: 'AFCON animation bumper',
        screen3: 'DJ transition'
      }
    },
    {
      id: 'fz-12',
      type: 'entertainment',
      time: '+00:50:00',
      title: 'Halftime Entertainment',
      screens: {
        screen1: 'On-ground show (flexible timing)',
        screen2: 'Branded visuals / sponsor content',
        screen3: 'DJ set or artistic troupe'
      }
    },
    {
      id: 'fz-13',
      type: 'entertainment',
      time: '+00:55:00',
      title: 'Back to Match',
      screens: {
        screen1: 'Clear stage immediately',
        screen2: '"Second Half Coming Soon" loop',
        screen3: 'DJ fade down'
      }
    },
    {
      id: 'fz-14',
      type: 'match',
      time: '+01:00:00',
      title: 'Match – Second Half',
      screens: {
        screen1: 'Crowd viewing',
        screen2: 'Live match feed',
        screen3: 'Match audio priority'
      }
    },
    {
      id: 'fz-15',
      type: 'music',
      time: '+01:45:00',
      title: 'Post-Match Reaction',
      screens: {
        screen1: 'Celebration moment',
        screen2: 'Final score graphic',
        screen3: 'DJ high energy'
      }
    },
    {
      id: 'fz-16',
      type: 'music',
      time: '+01:55:00',
      title: 'Match Wrap',
      screens: {
        screen1: 'Crowd circulation',
        screen2: 'Result + next match promo',
        screen3: 'DJ + MC recap'
      }
    },
    {
      id: 'fz-17',
      type: 'music',
      time: '+02:10:00',
      title: 'Reset Phase',
      screens: {
        screen1: 'Cleaning & technical checks',
        screen2: 'Countdown to next match',
        screen3: 'DJ medium'
      }
    },
    {
      id: 'fz-18',
      type: 'music',
      time: '+02:15:00',
      title: 'Fan Zone Loop',
      screens: {
        screen1: 'Engagement & rest period',
        screen2: 'AFCON content + sponsors',
        screen3: 'DJ continuous'
      }
    },
    {
      id: 'fz-19',
      type: 'match',
      time: '+02:30:00',
      title: 'Next Match Build-Up',
      screens: {
        screen1: 'Repeat full pre-match cycle',
        screen2: 'Match card',
        screen3: 'DJ + MC'
      }
    },
    {
      id: 'fz-20',
      type: 'closing',
      time: '+03:00:00',
      title: 'Cool Down',
      screens: {
        screen1: 'Gradual crowd exit',
        screen2: 'Thank you message + sponsors',
        screen3: 'Background music (low)'
      }
    },
    {
      id: 'fz-21',
      type: 'closing',
      time: '+03:45:00',
      title: 'Closing Announcements',
      screens: {
        screen1: 'Guided exits',
        screen2: 'Transport & safety slides',
        screen3: 'MC announcements'
      }
    },
    {
      id: 'fz-22',
      type: 'closing',
      time: '+04:00:00',
      title: 'Closure',
      screens: {
        screen1: 'Full shutdown',
        screen2: 'AFCON closing loop',
        screen3: 'Audio off'
      }
    }
  ]
}

// Default non-matchday schedule template
export const defaultNonMatchdaySchedule: FanZoneSchedule = {
  id: 'default-nonmatchday',
  name: 'Fan Zone Non-Matchday Schedule',
  items: [
    {
      id: 'nm-1',
      type: 'opening',
      time: '-02:00:00',
      title: 'Fan Zone Opening',
      screens: {
        screen1: 'Welcome setup',
        screen2: 'AFCON branding loop',
        screen3: 'Background music'
      }
    },
    {
      id: 'nm-2',
      type: 'music',
      time: '-01:45:00',
      title: 'DJ Set Start',
      screens: {
        screen1: 'DJ booth active',
        screen2: 'Music visuals',
        screen3: 'DJ mix'
      }
    },
    {
      id: 'nm-3',
      type: 'entertainment',
      time: '-01:30:00',
      title: 'Interactive Games',
      screens: {
        screen1: 'Game stations open',
        screen2: 'Game instructions',
        screen3: 'MC announcements'
      }
    },
    {
      id: 'nm-4',
      type: 'entertainment',
      time: '-01:00:00',
      title: 'Cultural Performance',
      screens: {
        screen1: 'Stage performance',
        screen2: 'Artist info slides',
        screen3: 'Live audio'
      }
    },
    {
      id: 'nm-5',
      type: 'music',
      time: '-00:30:00',
      title: 'DJ Session',
      screens: {
        screen1: 'DJ booth',
        screen2: 'Music visuals',
        screen3: 'DJ mix'
      }
    },
    {
      id: 'nm-6',
      type: 'entertainment',
      time: '+00:00:00',
      title: 'Main Entertainment',
      screens: {
        screen1: 'Main stage show',
        screen2: 'Show graphics',
        screen3: 'Live audio'
      }
    },
    {
      id: 'nm-7',
      type: 'entertainment',
      time: '+00:45:00',
      title: 'Fan Activities',
      screens: {
        screen1: 'Fan engagement zone',
        screen2: 'Activity info',
        screen3: 'MC hosting'
      }
    },
    {
      id: 'nm-8',
      type: 'music',
      time: '+01:30:00',
      title: 'Afternoon DJ Set',
      screens: {
        screen1: 'DJ performance',
        screen2: 'Music visuals',
        screen3: 'DJ mix'
      }
    },
    {
      id: 'nm-9',
      type: 'closing',
      time: '+02:00:00',
      title: 'Closing Announcements',
      screens: {
        screen1: 'Guided exits',
        screen2: 'Info slides',
        screen3: 'MC announcements'
      }
    },
    {
      id: 'nm-10',
      type: 'closing',
      time: '+02:30:00',
      title: 'Fan Zone Closure',
      screens: {
        screen1: 'Full shutdown',
        screen2: 'AFCON closing loop',
        screen3: 'Audio off'
      }
    }
  ]
}
