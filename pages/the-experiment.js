import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'
import {
    TOTAL_SUPPLY,
    LIVE_ZENJAKU_COUNT,
    BURNED_COUNT,
    EXPERIMENT_START_DATE
} from '../config/constants'

export default function HowItWorks() {
    const { isDark, glitchActive, mounted } = useDarkMode()
    const [stats, setStats] = useState({ donated: 0, burned: 0, volume: 0 })
    const [loadingStats, setLoadingStats] = useState(true)

    const dayNumber = useMemo(() => {
        const start = new Date(EXPERIMENT_START_DATE)
        const now = new Date()
        const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
        const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        return Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1
    }, [])

    useEffect(() => {
        let cancelled = false
        fetch('/api/leaderboard?timeframe=allTime')
            .then(r => r.json())
            .then(data => {
                if (cancelled || !Array.isArray(data)) return
                const donated = data.reduce((s, x) => s + (Number(x.donated) || 0), 0)
                const burned = data.reduce((s, x) => s + (Number(x.burned) || 0), 0)
                const volume = data.reduce((s, x) => s + (Number(x.volume) || 0), 0)
                setStats({ donated, burned, volume })
            })
            .catch(e => console.error('[HowItWorks] leaderboard fetch failed', e))
            .finally(() => { if (!cancelled) setLoadingStats(false) })
        return () => { cancelled = true }
    }, [])

    if (!mounted) return null

    const text = isDark ? '#FFFFFF' : '#000000'
    const accent = isDark ? '#ff9900' : '#ff6600'
    const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
    const dividerBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
    const bg = isDark ? '#000' : '#fff'

    const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 3 })

    return (
        <>
            <Head>
                <title>How it Works | The Zenjaku Experiment</title>
                <meta name="description" content="Every trade fires a royalty. Half burns the supply forever. Half funds real-world impact. Your choices tip the balance." />
            </Head>

            <div className="pt-24 px-4 pb-24">
                <div className="max-w-6xl mx-auto font-mono">
                    {/* Hero */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-[10px] tracking-[0.5em] uppercase opacity-50 mb-4" style={{ color: text }}>
                            EXPERIMENT LOG · DAY {dayNumber}
                        </div>
                        <h1
                            className="text-3xl sm:text-4xl font-black tracking-tighter mb-4"
                            style={{
                                color: text,
                                textShadow: glitchActive
                                    ? (isDark ? '-2px -2px #ff0000, 2px 2px #00ff00' : '2px 2px #ff0000, -2px -2px #00ff00')
                                    : 'none'
                            }}
                        >
                            HOW IT WORKS
                        </h1>
                        <p className="text-sm opacity-70 max-w-2xl leading-relaxed" style={{ color: text }}>
                            Every trade fires a royalty. Half burns the supply forever. Half funds real-world impact.
                            <br />Your choices tip the balance.
                        </p>
                    </motion.div>

                    {/* Live Counters */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-px mb-16"
                        style={{ backgroundColor: dividerBg }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Stat label="LIVE SUPPLY" value={LIVE_ZENJAKU_COUNT.toLocaleString()} sub={`of ${TOTAL_SUPPLY.toLocaleString()}`} bg={bg} accent={accent} text={text} />
                        <Stat label="BURNED" value={BURNED_COUNT.toLocaleString()} sub="ELVES" bg={bg} accent={accent} text={text} />
                        <Stat label="DONATED" value={loadingStats ? '…' : fmt(stats.donated)} sub="SOL" bg={bg} accent={accent} text={text} />
                        <Stat label="BURN VALUE" value={loadingStats ? '…' : fmt(stats.burned)} sub="SOL" bg={bg} accent={accent} text={text} />
                    </motion.div>

                    {/* Mechanism Flow */}
                    <motion.div
                        className="mb-16"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-[10px] tracking-[0.5em] uppercase opacity-50 mb-6" style={{ color: text }}>
                            THE MECHANISM
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Step n="01" title="A TRADE" sub="On SOL (Tensor) or BTC (Magic Eden)" text={text} accent={accent} borderColor={borderColor} />
                            <Step n="02" title="ROYALTY FIRES" sub="0.69% of every trade" text={text} accent={accent} borderColor={borderColor} />
                            <Step n="03" title="50 / 50 SPLIT" sub="Half burns supply. Half funds impact." text={text} accent={accent} borderColor={borderColor} />
                            <Step n="04" title="BALANCE SHIFTS" sub="Recorded forever on-chain" text={text} accent={accent} borderColor={borderColor} />
                        </div>
                    </motion.div>

                    {/* Your Role + The Goal */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <section>
                            <h2 className="text-lg font-black tracking-tighter mb-3" style={{ color: text }}>YOUR ROLE</h2>
                            <p className="text-xs opacity-70 leading-relaxed whitespace-pre-line" style={{ color: text }}>
                                {`You're a player, not just a holder.
Your wallet is your weapon.
Your decisions fuel the experiment.`}
                            </p>
                        </section>
                        <section>
                            <h2 className="text-lg font-black tracking-tighter mb-3" style={{ color: text }}>THE GOAL</h2>
                            <p className="text-xs opacity-70 leading-relaxed whitespace-pre-line" style={{ color: text }}>
                                {`Light vs. dark. Burn vs. fund. Eternal struggle, eternal balance.
Play your part, tip the scale, witness the story unfold.`}
                            </p>
                        </section>
                    </motion.div>

                    {/* Transparency */}
                    <motion.div
                        className="mb-16"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <div className="text-[10px] tracking-[0.5em] uppercase opacity-50 mb-6" style={{ color: text }}>
                            TRANSPARENCY
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <WalletCard
                                label="BURN DESTINATION"
                                sub="Supply sent here is removed from circulation."
                                address="9yw9hUdZCHruZsXdzkY4iaFMPDthegM8DqyrUhucSWsM"
                                text={text}
                                accent={accent}
                                borderColor={borderColor}
                            />
                            <WalletCard
                                label="IMPACT WALLET"
                                sub="Funds real-world causes."
                                address="6scYfnYS2bQxNG9sXohtHpndNbtutotBdgxcvftzUxrr"
                                text={text}
                                accent={accent}
                                borderColor={borderColor}
                            />
                        </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        className="border-t pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6"
                        style={{ borderColor }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div>
                            <div className="text-[10px] tracking-[0.5em] uppercase opacity-50 mb-2" style={{ color: text }}>
                                ENTER THE EXPERIMENT
                            </div>
                            <div className="text-sm opacity-70" style={{ color: text }}>
                                Pick a chain. Every trade tips the balance.
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <a
                                href="https://www.tensor.trade/trade/zenjaku"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 border text-xs tracking-widest uppercase hover:opacity-60 transition-opacity"
                                style={{ color: text, borderColor: text }}
                            >
                                COLLECT ON SOL ↗
                            </a>
                            <a
                                href="https://magiceden.io/ordinals/marketplace/zenjaku"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 border text-xs tracking-widest uppercase hover:opacity-60 transition-opacity"
                                style={{ color: text, borderColor: text }}
                            >
                                COLLECT ON BTC ↗
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    )
}

function Stat({ label, value, sub, bg, accent, text }) {
    return (
        <div className="p-5" style={{ backgroundColor: bg }}>
            <div className="text-[9px] tracking-[0.3em] uppercase opacity-50 mb-2" style={{ color: text }}>
                {label}
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tighter" style={{ color: accent }}>
                {value}
            </div>
            <div className="text-[8px] tracking-[0.3em] uppercase opacity-50 mt-1" style={{ color: text }}>
                {sub}
            </div>
        </div>
    )
}

function Step({ n, title, sub, text, accent, borderColor }) {
    return (
        <div className="p-4 border relative" style={{ borderColor }}>
            <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: accent }}>
                {n}
            </div>
            <div className="text-sm font-black tracking-tight mb-1" style={{ color: text }}>
                {title}
            </div>
            <div className="text-[10px] leading-relaxed opacity-60" style={{ color: text }}>
                {sub}
            </div>
        </div>
    )
}

function WalletCard({ label, sub, address, text, accent, borderColor }) {
    const [copied, setCopied] = useState(false)
    const short = `${address.slice(0, 6)}…${address.slice(-6)}`

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch (e) {
            console.error('clipboard write failed', e)
        }
    }

    return (
        <div className="p-4 border" style={{ borderColor }}>
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-1" style={{ color: text }}>
                {label}
            </div>
            <div className="text-[10px] opacity-60 mb-4" style={{ color: text }}>
                {sub}
            </div>
            <div className="flex items-center gap-4 mb-2">
                <span className="font-mono text-xs tracking-wide" style={{ color: accent }}>
                    {short}
                </span>
                <button
                    onClick={onCopy}
                    className="text-[9px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: text }}
                >
                    {copied ? 'COPIED' : 'COPY'}
                </button>
                <a
                    href={`https://solscan.io/account/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: text }}
                >
                    SOLSCAN ↗
                </a>
            </div>
            <div className="text-[9px] opacity-40 break-all font-mono" style={{ color: text }}>
                {address}
            </div>
        </div>
    )
}
