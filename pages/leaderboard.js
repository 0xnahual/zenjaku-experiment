import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'

// Mock Data with Addresses
const MOCK_DATA = {
  allTime: [
    { rank: 1, address: 'darkknight.sol', volume: 150000, avatar: 'ZM' },
    { rank: 2, address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrx', volume: 125000, avatar: 'CR' },
    { rank: 3, address: 'satoshi.sol', volume: 98000, avatar: 'SS' },
    { rank: 4, address: 'Gv2W...9zXy', volume: 85000, avatar: 'BW' },
    { rank: 5, address: 'phantom.sol', volume: 72000, avatar: 'ES' },
  ],
  monthly: [
    { rank: 1, address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrx', volume: 45000, avatar: 'CR' },
    { rank: 2, address: 'darkknight.sol', volume: 38000, avatar: 'ZM' },
    { rank: 3, address: 'wave.sol', volume: 22000, avatar: 'NW' },
    { rank: 4, address: 'satoshi.sol', volume: 18000, avatar: 'SS' },
    { rank: 5, address: 'trader.sol', volume: 15000, avatar: 'TJ' },
  ],
  daily: [
    { rank: 1, address: 'wave.sol', volume: 5000, avatar: 'NW' },
    { rank: 2, address: 'daytrader.sol', volume: 4200, avatar: 'DT' },
    { rank: 3, address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrx', volume: 3800, avatar: 'CR' },
    { rank: 4, address: 'darkknight.sol', volume: 3100, avatar: 'ZM' },
    { rank: 5, address: 'fast.sol', volume: 2500, avatar: 'QF' },
  ]
}

const formatAddress = (address) => {
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function Leaderboard() {
  const { isDark, mounted } = useDarkMode()
  const [timeframe, setTimeframe] = useState('allTime')
  const [data, setData] = useState(MOCK_DATA.allTime)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/leaderboard')
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

    // Fetch real data for ALL tabs for now to avoid showing fake addresses.
    // In the future, we can pass ?timeframe=monthly to the API.
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
              {data.map((item, index) => (
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
                  <div className="text-right">
                    <div className={`font-mono text-sm font-bold tracking-tight ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}>
                      {item.volume.toLocaleString()} SOL
                    </div>
                    <div className={`font-mono text-[9px] tracking-widest uppercase opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
                      VOLUME
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
