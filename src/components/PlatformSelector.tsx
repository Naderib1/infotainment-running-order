import { Monitor, Users } from 'lucide-react'

interface PlatformSelectorProps {
  onSelectPlatform: (platform: 'matches' | 'fanzones') => void
}

export function PlatformSelector({ onSelectPlatform }: PlatformSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Infotainment Running Order
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            TotalEnergies CAF Africa Cup of Nations, Morocco 2025
          </p>
        </div>

        {/* Platform Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Matches Card */}
          <button
            onClick={() => onSelectPlatform('matches')}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Stadium Matches
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                View running orders for individual matches with kick-off times, team info, and detailed schedules.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                  52 Matches
                </span>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                  Match-specific
                </span>
              </div>
            </div>
          </button>

          {/* Fan Zones Card */}
          <button
            onClick={() => onSelectPlatform('fanzones')}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Fan Zones
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Running order guide for fan zone screens with multi-screen layout and entertainment schedule.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  Multi-Screen
                </span>
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 rounded-full text-sm">
                  Daily Guide
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Select a platform to view the running order
        </p>
      </div>
    </div>
  )
}
