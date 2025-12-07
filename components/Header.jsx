import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useDarkMode } from '../contexts/DarkModeContext'
import { HiMenu, HiX } from 'react-icons/hi'

// Pages that should always be dark mode
const FORCE_DARK_PAGES = ['/solana', '/transformation']

const Header = () => {
    const router = useRouter()
    const { isDark: contextIsDark, glitchActive, mounted } = useDarkMode()
    const [menuOpen, setMenuOpen] = useState(false)
    const [openDropdown, setOpenDropdown] = useState(null)
    const [dropdownTimeout, setDropdownTimeout] = useState(null)

    // Force dark mode on certain pages
    const forceDark = FORCE_DARK_PAGES.includes(router.pathname)
    const isDark = forceDark || contextIsDark

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (dropdownTimeout) {
                clearTimeout(dropdownTimeout)
            }
        }
    }, [dropdownTimeout])

    const links = [
        {
            name: 'How it Works',
            link: '/manifesto',
            isExternal: false
        },
        {
            name: 'Collection',
            link: '/bitcoin',
            isExternal: false,
            hasDropdown: true,
            dropdownId: 'collection',
            dropdownItems: [
                {
                    name: 'The Zenjaku (SOL)',
                    link: '/solana'
                },
                {
                    name: 'Zenjaku Legends (BTC)',
                    link: '/bitcoin'
                },
                {
                    name: 'Transformation',
                    link: '/transformation'
                }
            ]
        },
        {
            name: 'The Game',
            link: '/cemetery',
            isExternal: false,
            hasDropdown: true,
            dropdownId: 'game',
            dropdownItems: [
                {
                    name: 'The Fallen',
                    link: '/cemetery',
                    comingSoon: "EXPERIMENT NOT YET STARTED"
                },
                {
                    name: 'Leaderboard',
                    link: '/leaderboard',
                    comingSoon: "EXPERIMENT NOT YET STARTED"
                },
                {
                    name: 'The Treasury',
                    link: '/treasury',
                    comingSoon: "EXPERIMENT NOT YET STARTED"
                }
            ]
        },
        {
            name: 'COLLECT',
            link: '#',
            isExternal: false,
            hasDropdown: true,
            isCta: true,
            dropdownId: 'collect',
            dropdownItems: [
                {
                    name: 'SOL (TENSOR)',
                    link: 'https://www.tensor.trade/trade/zenjaku',
                    isExternal: true
                },
                {
                    name: 'BTC (MAGIC EDEN)',
                    link: 'https://magiceden.io/ordinals/marketplace/zenjaku',
                    isExternal: true
                }
            ]
        }
    ]

    // Don't wait for mount on force dark pages - render immediately with dark styles
    if (!mounted && !forceDark) {
        return null
    }

    return (
        <header className={`fixed top-0 left-0 w-full px-4 py-4 flex justify-between items-center z-50 ${isDark ? 'bg-gradient-to-b from-black/90 to-black/0' : 'bg-gradient-to-b from-white/90 to-white/0'}`}>
            <Link href="/" className="font-mono z-20">
                <div
                    className={`text-[10px] tracking-[0.5em] uppercase transition-opacity duration-300 ${glitchActive ? 'opacity-30' : 'opacity-50'}`}
                    style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                >
                    THE ZENJAKU EXPERIMENT

                </div>
                <div
                    className={`text-xs tracking-[0.3em] uppercase transform transition-transform duration-300 ${glitchActive ? 'translate-x-[2px]' : ''}`}
                    style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                >
                    禅衡者实验 | A GAME OF BALANCE
                </div>
            </Link>

            {/* Hamburger for mobile */}
            <button
                className="md:hidden z-30 p-2 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
            >
                {menuOpen
                    ? <HiX size={28} style={{ color: isDark ? '#fff' : '#111' }} />
                    : <HiMenu size={28} style={{ color: isDark ? '#fff' : '#111' }} />}
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:block">
                <ul className="flex items-center space-x-8">
                    {links.map((link) => (
                        <li key={link.name} className="relative">
                            {link.hasDropdown ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => {
                                        if (dropdownTimeout) {
                                            clearTimeout(dropdownTimeout)
                                            setDropdownTimeout(null)
                                        }
                                        setOpenDropdown(link.dropdownId)
                                    }}
                                    onMouseLeave={() => {
                                        const timeout = setTimeout(() => {
                                            setOpenDropdown(null)
                                        }, 150)
                                        setDropdownTimeout(timeout)
                                    }}
                                >
                                    <button
                                        className={`font-mono text-xs tracking-widest uppercase transition-all 
                                            ${link.isCta
                                                ? `px-6 py-2 border ${isDark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`
                                                : `hover:opacity-70 ${isDark ? 'text-white' : 'text-black'}`
                                            }`}
                                        onClick={() => setOpenDropdown(openDropdown === link.dropdownId ? null : link.dropdownId)}
                                    >
                                        {link.name}
                                    </button>
                                    {openDropdown === link.dropdownId && (
                                        <div
                                            className={`absolute top-full text-left ${link.isCta ? 'right-0' : 'left-0'} mt-2 py-2 min-w-[200px] rounded shadow-lg z-50 ${isDark ? 'bg-black border border-gray-700' : 'bg-white border border-gray-200'}`}
                                            onMouseEnter={() => {
                                                if (dropdownTimeout) {
                                                    clearTimeout(dropdownTimeout)
                                                    setDropdownTimeout(null)
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                const timeout = setTimeout(() => {
                                                    setOpenDropdown(null)
                                                }, 150)
                                                setDropdownTimeout(timeout)
                                            }}
                                        >
                                            {link.dropdownItems.map((item) => (
                                                item.comingSoon ? (
                                                    <div
                                                        key={item.name}
                                                        className={`block px-4 py-2 font-mono text-xs tracking-wide uppercase cursor-not-allowed opacity-50 ${isDark ? 'text-white' : 'text-black'}`}
                                                    >
                                                        <span className={`inline-block ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>
                                                            [[{item.name}]]
                                                        </span>
                                                    </div>
                                                ) : item.isExternal ? (
                                                    <a
                                                        key={item.name}
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`block px-4 py-2 font-mono text-xs tracking-wide uppercase hover:opacity-70 transition-opacity ${isDark ? 'text-white hover:bg-gray-900' : 'text-black hover:bg-gray-100'}`}
                                                        onClick={() => setOpenDropdown(null)}
                                                    >
                                                        {item.name}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        key={item.name}
                                                        href={item.link}
                                                        className={`block px-4 py-2 font-mono text-xs tracking-wide uppercase hover:opacity-70 transition-opacity ${isDark ? 'text-white hover:bg-gray-900' : 'text-black hover:bg-gray-100'}`}
                                                        onClick={() => setOpenDropdown(null)}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : link.isExternal ? (
                                <a
                                    href={link.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`font-mono text-xs tracking-widest uppercase hover:opacity-70 transition-opacity border-b border-current ${isDark ? 'text-white' : 'text-black'}`}
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    href={link.link}
                                    className={`font-mono text-xs tracking-widest uppercase hover:opacity-70 transition-opacity ${isDark ? 'text-white' : 'text-black'}`}
                                >
                                    {link.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Mobile Nav Dropdown */}
            {menuOpen && (
                <nav className={`fixed inset-0 flex flex-col items-center justify-center z-40 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    <button
                        className="absolute top-6 right-6 z-50 p-2 focus:outline-none"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close navigation menu"
                    >
                        <HiX size={32} className={isDark ? 'text-white' : 'text-black'} />
                    </button>
                    <ul className="flex flex-col gap-8 text-2xl font-mono uppercase">
                        {links.map((link) => (
                            <li key={link.name}>
                                {link.hasDropdown ? (
                                    <div className="flex flex-col gap-4">
                                        <span className={`font-mono text-2xl tracking-widest uppercase border-b border-[#222] pb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                            {link.name}
                                        </span>
                                        <div className="flex flex-col gap-2 ml-4">
                                            {link.dropdownItems.map((item) => (
                                                item.comingSoon ? (
                                                    <div
                                                        key={item.name}
                                                        className={`font-mono text-lg tracking-wide uppercase cursor-not-allowed opacity-50 ${isDark ? 'text-white' : 'text-black'}`}
                                                    >
                                                        <span className={`inline-block ${isDark ? 'bg-white/20 text-transparent select-none' : 'bg-black/20 text-transparent select-none'} animate-pulse`}>
                                                            [[{item.name}]]
                                                        </span>
                                                    </div>
                                                ) : item.isExternal ? (
                                                    <a
                                                        key={item.name}
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`font-mono text-lg tracking-wide uppercase hover:text-[#ff9900] transition-colors ${isDark ? 'text-white' : 'text-black'}`}
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        {item.name}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        key={item.name}
                                                        href={item.link}
                                                        className={`font-mono text-lg tracking-wide uppercase hover:text-[#ff9900] transition-colors ${isDark ? 'text-white' : 'text-black'}`}
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ) : link.isExternal ? (
                                    <a
                                        href={link.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`font-mono text-2xl tracking-widest uppercase hover:text-[#ff9900] transition-colors border-b border-[#222] pb-2 ${isDark ? 'text-white' : 'text-black'}`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                ) : (
                                    <Link
                                        href={link.link}
                                        className={`font-mono text-2xl tracking-widest uppercase hover:text-[#ff9900] transition-colors border-b border-[#222] pb-2 ${isDark ? 'text-white' : 'text-black'}`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    )
}

export default Header
