import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'
import { TOTAL_VALUE_BURNED, BURNED_COUNT } from '../config/constants'

export default function Home() {
    const { isDark, glitchActive, mounted } = useDarkMode()
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [randomGirlIndex, setRandomGirlIndex] = useState(0)

    useEffect(() => {
        if (!mounted) return
        setRandomGirlIndex(Math.floor(Math.random() * 11))
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
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" href="/favicon.png" />
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
                                <span className="block">3,089</span>
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
                        <p
                            className="font-mono text-xs sm:text-sm font-medium max-w-full md:max-w-[480px] text-left"
                            style={{ color: isDark ? '#FFFFFF' : '#444444' }}
                        >
                            A collection of <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>3,100</span> 3,089 elves trapped in an eternal struggle.
                            As half of the royalties turn them into ash, the other saves the world.
                            Witness the balance unfold as part of our community.
                        </p>
                        <div className="flex flex-row gap-8 font-mono text-sm tracking-widest uppercase pt-2 whitespace-nowrap text-left"
                            style={{ color: isDark ? '#FFFFFF' : '#000000' }}>
                            <div className="underline underline-offset-2 decoration-1 hover:opacity-70 transition-opacity cursor-pointer">
                                3,089 PFPS ON SOL
                            </div>
                            <div className="underline underline-offset-2 decoration-1 hover:opacity-70 transition-opacity cursor-pointer">
                                50 1/1S ON BTC
                            </div>
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
