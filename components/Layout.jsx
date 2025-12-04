import { useDarkMode } from '../contexts/DarkModeContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ScrambleText from './ScrambleText'

// Pages that should always be dark mode
const FORCE_DARK_PAGES = ['/zenjaku']

export default function Layout({ children }) {
    const router = useRouter()
    const { isDark: contextIsDark, glitchActive, mounted } = useDarkMode()

    // Force dark mode on certain pages
    const forceDark = FORCE_DARK_PAGES.includes(router.pathname)
    const isDark = forceDark || contextIsDark

    const [timestamp, setTimestamp] = useState('')

    useEffect(() => {
        if (!mounted && !forceDark) return
        updateTimestamp()
        const timestampInterval = setInterval(updateTimestamp, 1000)
        return () => clearInterval(timestampInterval)
    }, [mounted, forceDark])

    const updateTimestamp = () => {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        setTimestamp(`${date}_${random}`)
    }

    // Don't wait for mount on force dark pages - render immediately with dark styles
    if (!mounted && !forceDark) {
        return null
    }

    return (
        <main className={`min-h-screen w-full relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-black' : 'bg-white'}`}>
            {children}

            <div className="fixed bottom-4 right-4 font-mono text-[8px] sm:text-[10px] tracking-wider z-20 text-right">
                <div
                    className={`transition-opacity duration-300`}
                    style={{
                        color: isDark ? '#FFFFFF' : '#000000',
                        opacity: glitchActive ? 0.8 : 0.5
                    }}
                >
                    LIGHT_AGENT: {isDark ? 'DORMANT' : 'ACTIVE'}
                    <br />
                    DARK_AGENT: {isDark ? 'ACTIVE' : 'DORMANT'}
                </div>
            </div>

            <div
                className="fixed bottom-4 left-4 font-mono text-[8px] sm:text-[10px] tracking-wider z-20 transition-opacity duration-300"
                style={{
                    color: isDark ? '#FFFFFF' : '#000000',
                    opacity: glitchActive ? 0.8 : 0.5
                }}
            >
                {timestamp}
            </div>

            {/* Centered Footer Credit */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full flex justify-center z-20 pointer-events-none">
                <div
                    className="font-mono text-[8px] sm:text-[10px] tracking-wider opacity-70 text-center pointer-events-auto min-w-[120px] min-h-[1em] flex items-center gap-1"
                    style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                >
                    <span>a social experiment by</span>
                    <span className="font-bold ghost-text">
                        <ScrambleText text="THE ARCHITECT" />
                    </span>
                </div>
            </div>

            {glitchActive && (
                <>
                    <div className="absolute inset-0 bg-red-500 mix-blend-multiply opacity-20" style={{ clipPath: 'polygon(0 25%, 100% 25%, 100% 26%, 0 26%)' }}></div>
                    <div className="absolute inset-0 bg-blue-500 mix-blend-multiply opacity-20" style={{ clipPath: 'polygon(0 75%, 100% 75%, 100% 76%, 0 76%)' }}></div>
                </>
            )}
        </main>
    )
} 