
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Head from 'next/head'
import arweaveData from '../data/arweave-uploads.json'
import pastImages from '../data/past_image_urls.json'
import Header from '../components/Header'
import GlitchArrow from '../components/GlitchArrow'

export default function Transformation() {
    const [searchTerm, setSearchTerm] = useState('')
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [validItems, setValidItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const allItems = Object.entries(arweaveData).map(([filename, url], index) => {
            const id = filename.replace('.png', '')
            const tokenNumber = index + 1
            return {
                tokenNumber: tokenNumber.toString(),
                id: id,
                currentImage: url,
                pastImage: pastImages[id] || null,
                name: `#${tokenNumber.toString().padStart(3, '0')}`
            }
        })

        const filtered = allItems.filter(item => {
            if (item.pastImage && (item.pastImage.includes('nftstorage.link') || item.pastImage.includes('ipfs'))) {
                return false
            }
            return true
        })

        setValidItems(filtered)

        const defaultItem = filtered.find(item => item.tokenNumber === '31') || filtered[0]
        if (defaultItem) {
            setResult(defaultItem)
        }
        setIsLoading(false)
    }, [])

    const handleSearch = (e) => {
        if (e) e.preventDefault()
        setError('')

        if (!searchTerm && !result) return

        const term = searchTerm.trim()
        const foundItem = validItems.find(item =>
            item.tokenNumber === term ||
            item.id === term ||
            item.name === `#${term}` ||
            item.name === term
        )

        if (foundItem) {
            setResult(foundItem)
            setSearchTerm('')
        } else {
            setError('Not found.')
        }
    }

    const handleNext = () => {
        if (!result || validItems.length === 0) return
        const currentIndex = validItems.findIndex(item => item.tokenNumber === result.tokenNumber)
        if (currentIndex === -1) return
        const nextIndex = (currentIndex + 1) % validItems.length
        setResult(validItems[nextIndex])
    }

    const handlePrev = () => {
        if (!result || validItems.length === 0) return
        const currentIndex = validItems.findIndex(item => item.tokenNumber === result.tokenNumber)
        if (currentIndex === -1) return
        const prevIndex = (currentIndex - 1 + validItems.length) % validItems.length
        setResult(validItems[prevIndex])
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext()
            if (e.key === 'ArrowLeft') handlePrev()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [result, validItems])

    if (isLoading) return <div className="min-h-screen bg-black" />

    return (
        <div className="h-screen bg-black text-white font-mono selection:bg-[#ff9900] selection:text-black overflow-hidden relative flex flex-col">
            <Head>
                <title>Transformation | The Zenjaku</title>
            </Head>

            <Header />

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

            {/* Navigation Areas */}
            <button
                onClick={handlePrev}
                className="absolute left-0 top-0 bottom-0 w-[15vw] z-20 flex items-center justify-start pl-8 cursor-pointer group focus:outline-none"
            >
                <span className="text-4xl font-light text-zinc-800 group-hover:text-[#ff9900] transition-colors duration-300">←</span>
            </button>

            <button
                onClick={handleNext}
                className="absolute right-0 top-0 bottom-0 w-[15vw] z-20 flex items-center justify-end pr-8 cursor-pointer group focus:outline-none"
            >
                <span className="text-4xl font-light text-zinc-800 group-hover:text-[#ff9900] transition-colors duration-300">→</span>
            </button>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">

                {result && (
                    <div className="flex flex-col items-center gap-12 w-full max-w-6xl">

                        {/* Header Section */}
                        <div className="text-center space-y-4">
                            {/* Address - Styled as a data strip */}
                            <div className="inline-block border border-zinc-900 bg-zinc-900/50 px-4 py-1 rounded-full">
                                <p className="text-[10px] md:text-xs text-zinc-500 tracking-[0.15em] font-mono break-all font-bold">
                                    {result.id}
                                </p>
                            </div>

                            {/* Title - Significantly Less Prominent */}
                            <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-[#ff9900]/80">
                                TRANSFORMATION {result.name}
                            </h1>
                        </div>

                        {/* Visuals Container */}
                        <div className="relative flex items-center justify-center gap-4">

                            {/* Card 1: Vibe Knight - NOW ORANGE FRAMED */}
                            <div className="flex flex-col gap-3 group">
                                <div className="relative w-[30vh] h-[30vh] md:w-[40vh] md:h-[40vh] border border-[#ff9900]/30 bg-[#0a0a0a] p-1 transition-colors duration-500 group-hover:border-[#ff9900]">
                                    {result.pastImage ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={result.pastImage}
                                                alt="Before"
                                                fill
                                                className="object-contain"
                                                priority
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-[10px] text-zinc-800">NO SIGNAL</span>
                                        </div>
                                    )}
                                    {/* Corner Accents - Orange Now */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff9900] opacity-50" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ff9900] opacity-50" />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] tracking-[0.3em] font-bold text-[#ff9900] transition-colors uppercase">Vibe Knight</span>
                                    {result.pastImage && (
                                        <a href={result.pastImage} download className="text-[9px] text-[#ff9900] opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">
                                            [SAV]
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Center Connector - REMOVED */}

                            {/* Card 2: Zenjaku */}
                            <div className="flex flex-col gap-3 group">
                                <div className="relative w-[30vh] h-[30vh] md:w-[40vh] md:h-[40vh] border border-[#ff9900]/30 bg-[#0a0a0a] p-1 transition-colors duration-500 group-hover:border-[#ff9900]">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={result.currentImage}
                                            alt="After"
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                    {/* Corner Accents */}
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ff9900] opacity-50" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ff9900] opacity-50" />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] tracking-[0.3em] font-bold text-[#ff9900] transition-colors">ZENJAKU</span>
                                    <a href={result.currentImage} target="_blank" className="text-[9px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">
                                        [VIEW]
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Footer Search - Floating HUD style */}
                <div className="absolute bottom-12 z-30">
                    <form onSubmit={handleSearch} className="group relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SEARCH TOKEN ADDRESS OR NUMBER"
                            className="bg-zinc-900/50 border border-zinc-800 text-center text-[10px] tracking-[0.2em] uppercase text-white placeholder:text-zinc-600 focus:outline-none w-64 py-2 rounded-sm focus:border-[#ff9900]/50 transition-colors"
                        />
                        <button type="submit" className="hidden" />
                        {error && <div className="absolute top-full mt-2 w-full text-center text-[9px] text-red-500 tracking-widest">{error}</div>}
                    </form>
                </div>

            </main>
        </div>
    )
}
