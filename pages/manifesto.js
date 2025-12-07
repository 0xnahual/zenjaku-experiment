import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'

export default function Manifesto() {
    const { isDark, glitchActive, mounted } = useDarkMode()

    // const manifestoSections = [
    //     {
    //         title: "WELCOME TO THE EXPERIMENT",
    //         content: (
    //             <>
    //                 <span style={{textDecoration: 'line-through', opacity: 0.6}}>3,100</span> 3,089 elves trapped inside the chain.{"\n"}
    //                 Every trade shifts the outcome.{"\n"}
    //                 Half the royalties <a href="/cemetery" className="underline hover:opacity-80 transition-opacity" style={{color: isDark ? '#ff6600' : '#ff9900'}}>burn them from the blockchain</a>, half fuel <a href="/treasury" className="underline hover:opacity-80 transition-opacity" style={{color: isDark ? '#ff6600' : '#ff9900'}}>real-world impact</a>.{"\n"}
    //                 Your choices and actions balance the scales.
    //             </>
    //         )
    //     },
    //     {
    //         title: "THE RULES",
    //         content: (
    //             <>
    //                 • <a href="https://magiceden.io/collections/solana/zenjaku" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity" style={{color: isDark ? '#ff6600' : '#ff9900'}}>Collect a zenjaku</a> → join the struggle{"\n"}
    //                 • Royalties split: burn vs. save{"\n"}
    //                 • Every burn is permanent, every save ripples outward{"\n"}
    //                 • Live scoreboard — light vs. dark always shifting
    //             </>
    //         )
    //     },
    //     {
    //         title: "THE PLAYERS",
    //         content: "You're not just a holder. You're a player.\nYour wallet is your controller.\nYour decisions fuel the experiment."
    //     },
    //     {
    //         title: "THE PURPOSE",
    //         content: "This isn't just collecting. It's a ritual of balance.\nPlay your part, tip the scale, witness the story unfold."
    //     }
    // ]

    const manifestoSections = [
        {
            title: "WELCOME TO THE EXPERIMENT",
            content: (
                <>
                    <span className="opacity-50 line-through decoration-current">3,100</span> <span className="text-[#ff9900]">3,089</span> elves trapped inside the chain.{"\n"}
                    Every trade shifts the <span className={`inline-block px-1 mx-1 ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>[[OUTCOME]]</span>.{"\n"}
                    Half the royalties <span className={`inline-block px-1 mx-1 ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>[[BURN]]</span>, half fuel <span className={`inline-block px-1 mx-1 ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>[[SAVE]]</span>.{"\n"}
                    Your choices and actions balance the scales.
                </>
            )
        },
        {
            title: "THE RULES",
            content: (
                <>
                    • <span className="text-[#ff9900]">Collect a zenjaku</span> → join the struggle{"\n"}
                    • Royalties split: <span className={`inline-block px-1 mx-1 ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>[[REDACTED]]</span> vs. <span className={`inline-block px-1 mx-1 ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>[[REDACTED]]</span>{"\n"}
                    • Every <span className={`inline-block px-1 mx-1 ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>[[ACTION]]</span> is permanent{"\n"}
                    • Live scoreboard — light vs. dark always shifting
                </>
            )
        },
        {
            title: "THE PLAYERS",
            content: (
                <>
                    You're not just a holder. You're a <span className="text-[#ff9900]">player</span>.{"\n"}
                    Your wallet is your <span className={`inline-block px-1 mx-1 ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>[[WEAPON]]</span>.{"\n"}
                    Your decisions fuel the experiment.
                </>
            )
        },
        {
            title: "THE PURPOSE",
            content: (
                <>
                    This isn't just collecting. It's a ritual of balance.{"\n"}
                    Play your part, tip the scale, witness the <span className={`inline-block px-1 mx-1 ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>[[STORY]]</span> unfold.
                </>
            )
        }
    ]

    if (!mounted) {
        return null
    }

    return (
        <>
            <Head>
                <title>Manifesto | The Zenjaku Experiment</title>
                <meta name="description" content="The guiding principles of The Zenjaku Experiment" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>

            <div className="relative z-10 h-screen flex flex-col justify-center overflow-hidden">
                <div className="max-w-7xl mx-auto p-4 w-full h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center h-full">
                        {/* Left Column - Manifesto */}
                        <div className="space-y-4 lg:space-y-6 order-2 lg:order-1 max-h-full overflow-y-auto pr-2 lg:pr-4">
                            {manifestoSections.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    className="space-y-2"
                                >
                                    <motion.h2
                                        className="text-lg font-black tracking-tighter"
                                        animate={{ x: glitchActive ? -3 : 0 }}
                                        style={{
                                            color: isDark ? '#FFFFFF' : '#000000',
                                            textShadow: glitchActive ?
                                                (isDark ? '-3px -3px #ff0000, 3px 3px #00ff00' : '3px 3px #ff0000, -3px -3px #00ff00')
                                                : 'none'
                                        }}
                                    >
                                        {section.title}
                                    </motion.h2>
                                    <motion.div
                                        className="font-mono text-xs tracking-wide opacity-70 leading-relaxed"
                                        animate={{ opacity: glitchActive ? 0.9 : 0.7 }}
                                        style={{
                                            color: isDark ? '#FFFFFF' : '#000000',
                                            whiteSpace: 'pre-line'
                                        }}
                                    >
                                        {typeof section.content === 'string' ? section.content : section.content}
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Right Column - Artwork */}
                        <div className="relative aspect-square overflow-hidden order-1 lg:order-2 max-h-[70vh]">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div
                                    className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-1000"
                                    style={{
                                        backgroundImage: `url(./images/illustrations/illustration0.png)`,
                                        filter: `contrast(120%) brightness(1.1) ${isDark ? 'hue-rotate(180deg)' : ''}`,
                                        opacity: isDark ? 0.9 : 0.85,
                                        mixBlendMode: isDark ? 'screen' : 'multiply'
                                    }}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
