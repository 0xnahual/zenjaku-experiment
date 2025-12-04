import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDarkMode } from '../contexts/DarkModeContext'
import { HiMenu, HiX } from 'react-icons/hi'

const Header = () => {
    const { isDark, glitchActive, mounted } = useDarkMode()
    const [menuOpen, setMenuOpen] = useState(false)
    const [galleryDropdownOpen, setGalleryDropdownOpen] = useState(false)
    const [dropdownTimeout, setDropdownTimeout] = useState(null)

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
            name: ' Collection',
            link: '/gallery',
            isExternal: false,
            hasDropdown: true,
            dropdownItems: [
                {
                    name: 'The Zenjaku',
                    link: '/zenjaku'
                },
                {
                    name: 'Zenjaku Legends (BTC)',
                    link: '/gallery'
                }
            ]
        },


        {
            name: 'The Fallen',
            link: '/cemetery',
            isExternal: false
        },
        {
            name: 'Leaderboard',
            link: '/leaderboard',
            isExternal: false
        },
        {
            name: 'The Treasury',
            link: '/treasury',
            isExternal: false
        },
        {
            name: 'SOL',
            link: 'https://www.tensor.trade/trade/zenjaku',
            isExternal: true
        },
        {
            name: 'BTC',
            link: 'https://magiceden.io/ordinals/marketplace/zenjaku',
            isExternal: true
        }
    ]

    if (!mounted) {
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
                                        setGalleryDropdownOpen(true)
                                    }}
                                    onMouseLeave={() => {
                                        const timeout = setTimeout(() => {
                                            setGalleryDropdownOpen(false)
                                        }, 150)
                                        setDropdownTimeout(timeout)
                                    }}
                                >
                                    <button
                                        className={`font-mono text-xs tracking-widest uppercase hover:opacity-70 transition-opacity ${isDark ? 'text-white' : 'text-black'}`}
                                        onClick={() => setGalleryDropdownOpen(!galleryDropdownOpen)}
                                    >
                                        {link.name}
                                    </button>
                                    {galleryDropdownOpen && (
                                        <div
                                            className={`absolute top-full left-0 mt-2 py-2 min-w-[200px] rounded shadow-lg z-50 ${isDark ? 'bg-black border border-gray-700' : 'bg-white border border-gray-200'}`}
                                            onMouseEnter={() => {
                                                if (dropdownTimeout) {
                                                    clearTimeout(dropdownTimeout)
                                                    setDropdownTimeout(null)
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                const timeout = setTimeout(() => {
                                                    setGalleryDropdownOpen(false)
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
                                                        {item.name} <span className="text-[10px] opacity-60">(Coming Soon)</span>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        key={item.name}
                                                        href={item.link}
                                                        className={`block px-4 py-2 font-mono text-xs tracking-wide uppercase hover:opacity-70 transition-opacity ${isDark ? 'text-white hover:bg-gray-900' : 'text-black hover:bg-gray-100'}`}
                                                        onClick={() => setGalleryDropdownOpen(false)}
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
                                                        {item.name} <span className="text-sm opacity-60">(Coming Soon)</span>
                                                    </div>
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
