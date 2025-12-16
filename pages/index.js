import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'
import Link from 'next/link'
import { TOTAL_VALUE_BURNED, BURNED_COUNT, TOTAL_SUPPLY, LIVE_ZENJAKU_COUNT } from '../config/constants'

export default function Home() {
    const { isDark, glitchActive, mounted } = useDarkMode()
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [randomGirlIndex, setRandomGirlIndex] = useState(0)
    const [priceData, setPriceData] = useState(null)
    const [donationBalance, setDonationBalance] = useState(null)
    const [burnBalance, setBurnBalance] = useState(null)

    useEffect(() => {
        if (!mounted) return
        setRandomGirlIndex(Math.floor(Math.random() * 10))
        
        // Fetch 24h avg price
        fetch('/api/last-sale')
            .then(res => res.json())
            .then(data => setPriceData(data))
            .catch(() => {})
        
        // Fetch donation balance
        fetch('/api/solana-balance?address=9yw9hUdZCHruZsXdzkY4iaFMPDthegM8DqyrUhucSWsM')
            .then(res => res.json())
            .then(data => setDonationBalance(data.balance))
            .catch(() => {})
        
        // Fetch burn balance
        fetch('/api/solana-balance?address=6scYfnYS2bQxNG9sXohtHpndNbtutotBdgxcvftzUxrr')
            .then(res => res.json())
            .then(data => setBurnBalance(data.balance))
            .catch(() => {})
    }, [mounted])

    useEffect(() => {
        if (!mounted) return
        const textInterval = setInterval(() => {
            setCurrentTextIndex((prev) => (prev + 1) % crypticTexts.length)
        }, 2000)
        return () => clearInterval(textInterval)
    }, [mounted])

    //Fix Github
    const crypticTexts = [
        "Light feeds darkness",
        "Chaos breeds order",
        "Greed fuels purpose",
        "Balance is inevitable"
    ]

    if (!mounted) {
        return null
    }

    return (
        <>
            <Head>
                <title>The Zenjaku Experiment</title>
                <meta name="description" content="A social experiment in duality. Two forces: one of chaos, one of order. Which side will prevail?" />
            </Head>

            <div className="w-full min-h-screen flex items-center justify-center bg-transparent pt-20 md:pt-0">
                <div className="flex flex-col md:flex-row w-full max-w-[1050px] h-auto md:h-[650px] mx-auto border-0 overflow-hidden items-center justify-center gap-10 px-8">
                    {/* Left: Text Block */}
                    <div className="flex flex-col justify-center items-start w-full md:w-1/2 h-auto md:h-full space-y-4">
                        <div className={`relative transition-transform duration-300 w-full ${glitchActive ? '-translate-x-[3px]' : ''}`}>
                            <h1
                                className="text-[4.5rem] md:text-[6.5rem] font-black tracking-tighter leading-[0.8] text-left"
                                style={{
                                    color: isDark ? '#FFFFFF' : '#000000',
                                    WebkitTextStroke: isDark ? '1px #FFF' : '1px #000',
                                    textShadow: glitchActive ?
                                        (isDark ? '-3px -3px #ff0000, 3px 3px #00ff00' : '3px 3px #ff0000, -3px -3px #00ff00')
                                        : 'none',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                <span className="block">{LIVE_ZENJAKU_COUNT.toLocaleString()}</span>
                                <span className="block mt-0">TRAPPED</span>
                                <span className="block mt-0">SOULS</span>
                            </h1>
                        </div>
                        <div className="h-8 md:h-10 relative overflow-hidden w-full">
                            {crypticTexts.map((text, index) => (
                                <div
                                    key={text}
                                    className={`absolute inset-0 font-mono text-lg font-medium tracking-wider transition-opacity duration-500 text-left`}
                                    style={{
                                        color: isDark ? '#FFFFFF' : '#000000',
                                        opacity: currentTextIndex === index ? 1 : 0,
                                        zIndex: 2
                                    }}
                                >
                                    {text}
                                </div>
                            ))}
                        </div>
                        {/* 
                        <p
                            className="font-mono text-xs sm:text-sm font-medium w-full text-left"
                            style={{ color: isDark ? '#AAAAAA' : '#444444' }}
                        >
                            Zenjaku is an on-chain experiment in duality.
                            <br />
                            <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>3,100</span> 3,089 elves trapped in an eternal struggle. Half of the royalties
                            turn them to ash
                            . Half
                            transforms reality
                            . Is balance power? Step in and find out.
                        </p> 
                        */}
                        <p
                            className="font-mono text-xs sm:text-sm font-medium w-full text-left leading-relaxed relative"
                            style={{
                                color: isDark ? '#FFFFFF' : '#000000',
                                textShadow: glitchActive ? (isDark ? '2px 0 #ff0000, -2px 0 #00ff00' : '2px 0 #ff0000, -2px 0 #00ffff') : 'none'
                            }}
                        >
                            Zenjaku is an on-chain experiment in duality.
                            <br />
                            <span className="opacity-50 line-through decoration-current">{TOTAL_SUPPLY.toLocaleString()}</span> <span className="text-[#ff9900]">{LIVE_ZENJAKU_COUNT.toLocaleString()}</span> elves trapped in an eternal struggle.
                            <br />
                            Half of the royalties fuel destruction. Half transform reality.
                            Is balance power? Step in and find out.
                        </p>
                        <div className="flex flex-row gap-8 font-mono text-sm tracking-widest uppercase pt-2 whitespace-nowrap text-left"
                            style={{ color: isDark ? '#FFFFFF' : '#000000' }}>
                            <Link href="/solana" className="underline underline-offset-2 decoration-1 hover:opacity-70 transition-opacity cursor-pointer">
                                {LIVE_ZENJAKU_COUNT.toLocaleString()} PFPS ON SOL
                            </Link>
                            <Link href="/bitcoin" className="underline underline-offset-2 decoration-1 hover:opacity-70 transition-opacity cursor-pointer">
                                33 1/1S ON BTC
                            </Link>
                        </div>
                        
                        {/* 24h Avg Price Indicator */}
                        {priceData?.avgPrice > 0 && (
                            <div className="flex items-center gap-2 font-mono text-xs tracking-wider pt-4"
                                style={{ color: isDark ? '#666666' : '#999999' }}>
                                <span className="inline-block w-2 h-2 rounded-full bg-[#ff9900] animate-pulse" />
                                <span>24H AVG</span>
                                <span className="text-[#ff9900] font-bold">{priceData.avgPrice.toFixed(3)} SOL</span>
                            </div>
                        )}
                        
                        {/* Balance Indicators */}
                        <div className="flex flex-col gap-2 font-mono text-xs tracking-wider pt-2">
                            {donationBalance !== null && (
                                <div className="flex items-center gap-2"
                                    style={{ color: isDark ? '#666666' : '#999999' }}>
                                    <span className="inline-block w-2 h-2 rounded-full bg-[#00cc00]" />
                                    <span>DONATION BALANCE</span>
                                    <span className="text-[#00cc00] font-bold">{donationBalance.toFixed(3)} SOL</span>
                                </div>
                            )}
                            {burnBalance !== null && (
                                <div className="flex items-center gap-2"
                                    style={{ color: isDark ? '#666666' : '#999999' }}>
                                    <span className="inline-block w-2 h-2 rounded-full bg-[#ff3333]" />
                                    <span>BURN BALANCE</span>
                                    <span className="text-[#ff3333] font-bold">{burnBalance.toFixed(3)} SOL</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right: Image Block */}
                    <div className="flex flex-col justify-center items-center w-full md:w-1/2 h-auto md:h-full px-0 md:pr-0">
                        <div className="relative w-full h-full aspect-square max-w-[500px] md:max-w-[700px] mx-auto flex items-stretch justify-center">
                            <div
                                className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-1000 h-full"
                                style={{
                                    backgroundImage: `url(./images/anime/girl${randomGirlIndex}.png)`,
                                    filter: isDark ? 'grayscale(100%) contrast(150%) invert(1)' : 'contrast(110%)',
                                    opacity: isDark ? 0.8 : 0.9,
                                    mixBlendMode: isDark ? 'screen' : 'normal',
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
