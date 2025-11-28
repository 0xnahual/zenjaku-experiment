import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'

const formatAddress = (address) => {
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function Leaderboard() {
  const { isDark, mounted } = useDarkMode()
  const [timeframe, setTimeframe] = useState('allTime')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        // Pass the current timeframe to the API
        const res = await fetch(`/api/leaderboard?timeframe=${timeframe}`)
        const json = await res.json()
        console.log('Leaderboard API response:', json)

        if (Array.isArray(json)) {
          setData(json)
        } else {
          setData([]) // Clear data if invalid response
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setData([]) // Show empty state on error, NOT fake data
      } finally {
        setLoading(false)
      }
    }

    // Fetch real data for ALL tabs.
    fetchLeaderboard()
  }, [timeframe])

  if (!mounted) return null

  const accent = isDark ? '#ff9900' : '#ff6600'

  return (
    <>
      <Head>
        <title>Leaderboard | The Zenjaku Experiment</title>
        <meta name="description" content="Top traders and contributors to the Zenjaku ecosystem." />
      </Head>
      <div className={`pt-24 px-4 pb-16 min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16 font-mono text-center">
            <div
              className="text-[10px] tracking-[0.5em] uppercase mb-4 opacity-50"
              style={{ color: isDark ? '#FFFFFF' : '#000000' }}
            >
              COMMUNITY IMPACT
            </div>
            <h1
              className="text-3xl font-black tracking-tighter mb-6"
              style={{ color: isDark ? '#FFFFFF' : '#000000' }}
            >
              LEADERBOARD
            </h1>
            <p
              className="text-sm opacity-70 max-w-2xl mx-auto leading-relaxed mb-2"
              style={{ color: isDark ? '#FFFFFF' : '#000000' }}
            >
              The architects of the ecosystem. These addresses are forging the path forward through volume and dedication.
            </p>
            <p
              className="text-[10px] font-mono tracking-wider uppercase"
              style={{ color: isDark ? '#ff9900' : '#ff6600', opacity: 0.8 }}
            >
              VERIFIED // ON-CHAIN // IMMUTABLE
            </p>

            {/* Timeframe Selector */}
            <div className="flex justify-center gap-8 border-b border-gray-800/20 pb-4 mt-12 mb-12">
              {['allTime', 'monthly', 'daily'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`font-mono text-xs tracking-widest uppercase transition-all duration-300 ${timeframe === tf
                    ? (isDark ? 'text-[#ff9900] opacity-100' : 'text-[#ff6600] opacity-100')
                    : (isDark ? 'text-white opacity-40 hover:opacity-70' : 'text-black opacity-40 hover:opacity-70')
                    }`}
                >
                  {tf === 'allTime' ? 'All Time' : tf}
                </button>
              ))}
            </div>

            {/* Leaderboard Table */}
            <div className="space-y-2">
              {loading ? (
                 <div className={`text-center py-12 font-mono text-sm opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
                    CALCULATING VOLUME...
                 </div>
              ) : data.length === 0 ? (
                 <div className={`text-center py-12 font-mono text-sm opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
                    NO TRADES FOUND FOR THIS PERIOD
                 </div>
              ) : (
                data.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between py-4 px-4 rounded-sm transition-colors ${isDark
                    ? 'hover:bg-white/5'
                    : 'hover:bg-black/5'
                    } ${loading ? 'opacity-50' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`font-mono text-sm w-6 text-center opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
                      {item.rank}
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}
                        style={{ color: index < 3 ? accent : undefined }}
                      >
                        {item.avatar}
                      </div>
                      <div className="text-left">
                        <div className={`font-mono text-sm tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>
                          {formatAddress(item.address)}
                        </div>
                        <div className={`font-mono text-[9px] tracking-widest uppercase opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
                          WALLET ADDRESS
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    {/* Primary: Volume */}
                    <div className="mb-1">
                        <div className={`font-mono text-lg font-bold tracking-tight ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}>
                          {item.volume.toLocaleString()}
                        </div>
                        <div className={`font-mono text-[9px] tracking-widest uppercase opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
                          VOLUME (SOL)
                        </div>
                    </div>
                    
                    {/* Secondary: Breakdown */}
                    <div className={`flex justify-end gap-3 font-mono text-[9px] mt-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bold opacity-80">{item.donated.toLocaleString()}</span>
                            <span className="tracking-wider text-[7px] uppercase opacity-40">DONATED</span>
                        </div>
                        <div className="w-px h-2 bg-current opacity-20 self-center"></div>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bold opacity-80">{item.burned.toLocaleString()}</span>
                            <span className="tracking-wider text-[7px] uppercase opacity-40">BURNED</span>
                        </div>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
