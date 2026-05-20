import React, { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'
import { EXPERIMENT_START_DATE } from '../config/constants'

export default function HowItWorks() {
    const { isDark, glitchActive, mounted } = useDarkMode()
    const [treasurySOL, setTreasurySOL] = useState(null)
    const [loading, setLoading] = useState(true)

    const dayNumber = useMemo(() => {
        const start = new Date(EXPERIMENT_START_DATE)
        const now = new Date()
        const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
        const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        return Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1
    }, [])

    useEffect(() => {
        let cancelled = false
        fetch('/api/treasury')
            .then(r => r.ok ? r.json() : null)
            .then(t => {
                if (cancelled) return
                if (t && typeof t.balanceSOL === 'number') setTreasurySOL(t.balanceSOL)
            })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    if (!mounted) return null

    const text = isDark ? '#FFFFFF' : '#000000'
    const accent = isDark ? '#ff9900' : '#ff6600'
    const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'

    const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 3 })

    return (
        <>
            <Head>
                <title>How it Works | The Zenjaku Experiment</title>
                <meta name="description" content="Every trade fires a royalty. Half burns the supply forever. Half funds real-world impact." />
            </Head>

            <div className="h-screen w-full flex items-center justify-center px-4 overflow-hidden">
                <div className="w-full max-w-3xl font-mono">
                    <div className="text-[10px] tracking-[0.5em] uppercase opacity-50 mb-3" style={{ color: text }}>
                        EXPERIMENT LOG · DAY {dayNumber}
                    </div>
                    <h1
                        className="text-3xl sm:text-4xl font-black tracking-tighter mb-3"
                        style={{
                            color: text,
                            textShadow: glitchActive
                                ? (isDark ? '-2px -2px #ff0000, 2px 2px #00ff00' : '2px 2px #ff0000, -2px -2px #00ff00')
                                : 'none'
                        }}
                    >
                        HOW IT WORKS
                    </h1>
                    <p className="text-sm opacity-70 leading-relaxed mb-6 max-w-2xl" style={{ color: text }}>
                        Every trade fires a 0.69% royalty. Half burns the supply forever. Half funds real-world impact.
                    </p>

                    <div className="mb-6 max-w-xs">
                        <div className="p-3 border" style={{ borderColor }}>
                            <div className="text-[9px] tracking-[0.3em] uppercase opacity-50 mb-1" style={{ color: text }}>
                                TREASURY
                            </div>
                            <div className="text-xl sm:text-2xl font-black tracking-tighter" style={{ color: accent }}>
                                {loading || treasurySOL === null ? '…' : fmt(treasurySOL)}
                            </div>
                            <div className="text-[8px] tracking-[0.3em] uppercase opacity-50 mt-1" style={{ color: text }}>
                                SOL AWAITING IMPACT
                            </div>
                        </div>
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
                </div>
            </div>
        </>
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
        <div className="p-3 border" style={{ borderColor }}>
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-1" style={{ color: text }}>
                {label}
            </div>
            <div className="text-[10px] opacity-60 mb-3" style={{ color: text }}>
                {sub}
            </div>
            <div className="flex items-center gap-4 mb-1">
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
                    href={`https://orbmarkets.io/address/${address}/history?hideSpam=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: text }}
                >
                    ORB ↗
                </a>
            </div>
            <div className="text-[9px] opacity-40 break-all font-mono" style={{ color: text }}>
                {address}
            </div>
        </div>
    )
}
