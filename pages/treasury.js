import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'

// Treasury stats and latest story (easy to update)
const TOTAL_DONATED = 0 // USD
const TREASURY_BALANCE = 0 // USD
const LATEST_STORY = {
  author: '',
  handle: '',
  avatar: '',
  text: '',
  date: '',
  tweetUrl: '',
  amount: 0
}

export default function Treasury() {
  const { isDark, mounted } = useDarkMode()

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>Treasury | The Zenjaku Experiment</title>
        <meta name="description" content="Transparent record of donations and treasury for Zenjaku. Half of all royalties are used to help others, restoring balance to the world." />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <div className={`pt-24 px-4 pb-16 min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16 font-mono text-center">
            <div
              className="text-[10px] tracking-[0.5em] uppercase mb-4 opacity-50"
              style={{ color: isDark ? '#FFFFFF' : '#000000' }}
            >
              REAL WORLD IMPACT
            </div>
            <h1
              className="text-3xl font-black tracking-tighter mb-6"
              style={{ color: isDark ? '#FFFFFF' : '#000000' }}
            >
              THE TREASURY
            </h1>
            <p
              className="text-sm opacity-70 max-w-2xl mx-auto leading-relaxed mb-2"
              style={{ color: isDark ? '#FFFFFF' : '#000000' }}
            >
              Half of all royalties are offered to the world — supporting causes, lifting others, and restoring balance beyond the chain.
            </p>
            <p
              className="text-[10px] font-mono tracking-wider uppercase"
              style={{ color: isDark ? '#ff9900' : '#ff6600', opacity: 0.8 }}
            >
              TRANSPARENT // IMPACTFUL // GLOBAL
            </p>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 mt-12">
              <div className="text-center">
                <div className={`font-mono text-3xl font-bold tracking-tighter ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}>
                  ${TOTAL_DONATED.toLocaleString()}
                </div>
                <div className={`font-mono text-[10px] tracking-widest uppercase opacity-40 mt-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  TOTAL DONATED
                </div>
              </div>
              <div className="hidden sm:block w-px bg-gray-800/20"></div>
              <div className="text-center">
                <div className={`font-mono text-3xl font-bold tracking-tighter ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}>
                  ${TREASURY_BALANCE.toLocaleString()}
                </div>
                <div className={`font-mono text-[10px] tracking-widest uppercase opacity-40 mt-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  TREASURY BALANCE
                </div>
              </div>
            </div>
          </div>

          {/* Latest Story */}
          <div className="space-y-0 border-t border-dashed border-gray-800/50">
            {/* Header for the list */}
            <div className={`py-4 px-4 border-b border-dashed border-gray-800/20 font-mono text-[10px] uppercase tracking-widest opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
              LATEST ACTIVITY
            </div>

            {/* Story Item */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 py-8 px-4 border-b border-dashed border-gray-800/20 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff9900] to-[#ff6600] flex items-center justify-center border border-[#ff9900]/40 text-white font-mono font-bold text-sm">
                  TC
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className={`font-mono text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {LATEST_STORY.author}
                  </span>
                  <span className={`font-mono text-xs opacity-50 ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}>
                    {LATEST_STORY.handle}
                  </span>
                  <span className={`font-mono text-[10px] opacity-30 ${isDark ? 'text-white' : 'text-black'}`}>
                    • {LATEST_STORY.date}
                  </span>
                </div>
                <p className={`font-mono text-sm opacity-70 leading-relaxed mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                  {LATEST_STORY.text}
                </p>
                {LATEST_STORY.tweetUrl && (
                  <a
                    href={LATEST_STORY.tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase border border-current px-3 py-1 hover:opacity-70 transition-opacity ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}
                  >
                    View on X <span>→</span>
                  </a>
                )}
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <div className={`font-mono text-xl font-bold tracking-tight ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}>
                  +${LATEST_STORY.amount.toLocaleString()}
                </div>
                <div className={`font-mono text-[9px] tracking-widest uppercase opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
                  DONATION
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 