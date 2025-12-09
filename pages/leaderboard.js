import { useState, useEffect } from 'react'
import Head from 'next/head'

const formatAddress = (address) => {
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function Leaderboard() {
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

  return (
    <>
      <Head>
        <title>Leaderboard | The Zenjaku Experiment</title>
        <meta name="description" content="Top traders and contributors to the Zenjaku ecosystem." />
      </Head>
      <div className="pt-24 px-4 pb-16 min-h-screen bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16 font-mono text-center">
            <div
              className="text-[10px] tracking-[0.5em] uppercase mb-4 opacity-50 text-black"
            >
              COMMUNITY IMPACT
            </div>
            <h1
              className="text-3xl font-black tracking-tighter mb-6 text-black"
            >
              LEADERBOARD
            </h1>
            <p
              className="text-sm opacity-70 max-w-2xl mx-auto leading-relaxed mb-2 text-black"
            >
              The architects of the ecosystem. These addresses are forging the path forward through volume and dedication.
            </p>
            <p
              className="text-[10px] font-mono tracking-wider uppercase text-[#ff6600] opacity-80"
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
                    ? 'text-[#ff6600] opacity-100'
                    : 'text-black opacity-40 hover:opacity-70'
                    }`}
                >
                  {tf === 'allTime' ? 'All Time' : tf}
                </button>
              ))}
            </div>

            {/* Leaderboard Table */}
            <div className="space-y-0 border-t border-dashed border-gray-800/50">
              {loading ? (
                <div className="text-center py-12 font-mono text-sm opacity-50 text-black">
                  [ CALCULATING_VOLUME... ]
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12 font-mono text-sm opacity-50 text-black">
                  [ NO_TRADES_FOUND ]
                </div>
              ) : (
                data.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between py-4 px-4 border-b border-dashed border-gray-800/20 transition-colors hover:bg-black/5 ${loading ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="font-mono text-sm w-12 text-left opacity-50 text-[#ff6600]">
                        #{String(item.rank).padStart(2, '0')}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <a
                            href={`https://orb.helius.dev/address/${item.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] text-gray-500 hover:text-[#ff6600] transition-colors"
                          >
                            {item.address}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      {/* Primary: Volume */}
                      <div className="mb-1">
                        <div className="font-mono text-lg font-bold tracking-tight text-[#ff6600]">
                          {item.volume.toLocaleString()}
                        </div>
                        <div className="font-mono text-[9px] tracking-widest uppercase opacity-40 text-black">
                          VOLUME (SOL)
                        </div>
                      </div>

                      {/* Secondary: Breakdown */}
                      <div className="flex justify-end gap-3 font-mono text-[9px] mt-2 text-black">
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

