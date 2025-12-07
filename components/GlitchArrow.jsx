
import { useEffect, useState } from 'react'

export default function GlitchArrow() {
    const [isGlitching, setIsGlitching] = useState(false)

    // Random glitch trigger
    useEffect(() => {
        const triggerGlitch = () => {
            // Random duration for the glitch burst
            const duration = Math.random() * 500 + 200
            setIsGlitching(true)

            setTimeout(() => {
                setIsGlitching(false)
            }, duration)

            // Schedule next glitch
            const nextTrigger = Math.random() * 3000 + 1000
            setTimeout(triggerGlitch, nextTrigger)
        }

        const timeout = setTimeout(triggerGlitch, 1000)
        return () => clearTimeout(timeout)
    }, [])

    return (
        <div className="relative flex flex-col items-center justify-center w-12 h-32 opacity-80">
            {/* Styles for the glitch animation */}
            <style jsx>{`
                @keyframes glitch-anim-1 {
                    0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
                    20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
                    40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
                    60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
                    80% { clip-path: inset(10% 0 60% 0); transform: translate(-1px, 1px); }
                    100% { clip-path: inset(30% 0 30% 0); transform: translate(1px, -1px); }
                }
                @keyframes glitch-anim-2 {
                    0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
                    20% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 2px); }
                    40% { clip-path: inset(30% 0 20% 0); transform: translate(2px, 1px); }
                    60% { clip-path: inset(10% 0 80% 0); transform: translate(-1px, -2px); }
                    80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, 2px); }
                    100% { clip-path: inset(20% 0 70% 0); transform: translate(-2px, -1px); }
                }
                .glitch-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .glitch-active-1 {
                    animation: glitch-anim-1 0.3s infinite linear alternate-reverse;
                    opacity: 0.8;
                }
                .glitch-active-2 {
                    animation: glitch-anim-2 0.3s infinite linear alternate-reverse;
                    opacity: 0.8;
                }
            `}</style>

            {/* Base Arrow */}
            <div className={`relative z-10 flex flex-col items-center gap-2 transition-opacity duration-100 ${isGlitching ? 'opacity-90' : 'opacity-100'}`}>
                <div className="text-sm font-mono font-black tracking-tighter text-[#ff9900] drop-shadow-[0_0_8px_rgba(255,153,0,0.8)] animate-pulse">
                    {`>>>`}
                </div>
            </div>

            {/* Glitch Layer 1 - Cyan/Blue Shift */}
            <div className={`glitch-layer text-cyan-400 mix-blend-screen ${isGlitching ? 'glitch-active-1 block' : 'hidden'}`}>
                <div className="text-sm font-mono font-black tracking-tighter">{`>>>`}</div>
            </div>

            {/* Glitch Layer 2 - Red/Orange Shift */}
            <div className={`glitch-layer text-red-500 mix-blend-screen ${isGlitching ? 'glitch-active-2 block' : 'hidden'}`}>
                <div className="text-sm font-mono font-black tracking-tighter">{`>>>`}</div>
            </div>

        </div>
    )
}
