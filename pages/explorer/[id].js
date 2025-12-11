import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Head from 'next/head'
import zenjakuMapping from '../../data/zenjaku-mapping.json'
import arweaveData from '../../data/arweave-uploads.json'
import pastImages from '../../data/past_image_urls.json'
import Header from '../../components/Header'
import { useDarkMode } from '../../contexts/DarkModeContext'

// Build items from the proper mapping
const allNumbers = Object.keys(zenjakuMapping).map(Number).sort((a, b) => a - b)
const totalCount = allNumbers.length
const maxNumber = Math.max(...allNumbers)

export default function Explorer() {
    const router = useRouter()
    const { id } = router.query
    const { mounted } = useDarkMode()
    const [nftData, setNftData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [inputValue, setInputValue] = useState('')
    const [showStateHistory, setShowStateHistory] = useState(false)

    useEffect(() => {
        if (!id) return
        const tokenNum = parseInt(id)
        const data = zenjakuMapping[tokenNum]
        
        if (data) {
            const mintAddress = data.address
            const imageUrl = arweaveData[`${mintAddress}.png`]
            setNftData({
                tokenNumber: tokenNum,
                id: mintAddress,
                currentImage: imageUrl,
                pastImage: pastImages[mintAddress] || null,
                name: `#${tokenNum.toString().padStart(4, '0')}`,
                traits: data.traits || {}
            })
            setInputValue(tokenNum.toString())
        }
        setIsLoading(false)
    }, [id])

    const handlePrev = () => {
        if (!nftData) return
        const prevNum = nftData.tokenNumber - 1
        if (prevNum >= 1 && zenjakuMapping[prevNum]) router.push(`/explorer/${prevNum}`)
    }

    const handleNext = () => {
        if (!nftData) return
        const nextNum = nftData.tokenNumber + 1
        if (nextNum <= maxNumber && zenjakuMapping[nextNum]) router.push(`/explorer/${nextNum}`)
    }

    const handleInputSubmit = (e) => {
        e.preventDefault()
        const num = parseInt(inputValue)
        if (num >= 1 && num <= maxNumber && zenjakuMapping[num]) {
            router.push(`/explorer/${num}`)
        }
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if typing in input
            if (document.activeElement.tagName === 'INPUT') return
            
            if (e.key === 'ArrowRight' && nftData && nftData.tokenNumber < maxNumber && zenjakuMapping[nftData.tokenNumber + 1]) {
                router.push(`/explorer/${nftData.tokenNumber + 1}`)
            } else if (e.key === 'ArrowLeft' && nftData && nftData.tokenNumber > 1 && zenjakuMapping[nftData.tokenNumber - 1]) {
                router.push(`/explorer/${nftData.tokenNumber - 1}`)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [nftData, router])

    if (!mounted || isLoading || !nftData) {
        return (
            <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-[#ff9900] font-mono text-xs animate-pulse">INDEXING...</div>
                </div>
            </div>
        )
    }

    const hasPrev = nftData.tokenNumber > 1 && zenjakuMapping[nftData.tokenNumber - 1]
    const hasNext = nftData.tokenNumber < maxNumber && zenjakuMapping[nftData.tokenNumber + 1]

    return (
        <>
            <Head>
                <title>ENTITY {nftData.tokenNumber} | ARCHIVE</title>
                <meta name="description" content={`Entity ${nftData.tokenNumber} — Core Archive`} />
            </Head>

            <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
                <div className="min-h-screen bg-black text-white">
                    <Header />

                    {/* Main Content */}
                    <div className="pt-24 pb-12 px-4">
                        <div className="max-w-4xl mx-auto">

                            {/* Main Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left: Image */}
                                <div>
                                    <div className="relative aspect-square border border-gray-800/50 bg-black">
                                        <Image
                                            src={nftData.currentImage}
                                            alt={`Entity ${nftData.tokenNumber}`}
                                            fill
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                    </div>
                                </div>

                                {/* Right: Details */}
                                <div className="font-mono text-xs space-y-3">
                                    {/* Navigation */}
                                    <div>
                                        <div className="text-gray-500 text-[10px] mb-1">ENTITY</div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handlePrev}
                                                disabled={!hasPrev}
                                                className={`text-sm ${hasPrev ? 'text-[#ff9900] hover:opacity-70' : 'text-gray-700 cursor-not-allowed'}`}
                                            >
                                                ←
                                            </button>
                                            <form onSubmit={handleInputSubmit} className="flex items-center">
                                                <input
                                                    type="text"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="w-14 bg-transparent text-2xl font-light text-[#ff9900] text-center focus:outline-none"
                                                />
                                            </form>
                                            <button
                                                onClick={handleNext}
                                                disabled={!hasNext}
                                                className={`text-sm ${hasNext ? 'text-[#ff9900] hover:opacity-70' : 'text-gray-700 cursor-not-allowed'}`}
                                            >
                                                →
                                            </button>
                                            <span className="text-gray-500 text-[10px]">/ {totalCount}</span>
                                        </div>
                                    </div>

                                    {/* Parameters */}
                                    <div className="border border-gray-700 divide-y divide-gray-700 text-[10px]">
                                        <div className="flex justify-between py-1.5 px-2">
                                            <span className="text-gray-500">INDEX</span>
                                            <span className="text-gray-300">{nftData.tokenNumber}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 px-2">
                                            <span className="text-gray-500">ADDRESS</span>
                                            <span className="text-[#ff9900]/70 text-[9px] break-all">{nftData.id}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 px-2">
                                            <span className="text-gray-500">CHAIN</span>
                                            <span className="text-gray-300">SOLANA</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 px-2">
                                            <span className="text-gray-500">SIGNAL</span>
                                            <span className="text-gray-300">ACTIVE</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 px-2">
                                            <span className="text-gray-500">STATE</span>
                                            {nftData.pastImage ? (
                                                <button 
                                                    onClick={() => setShowStateHistory(true)}
                                                    className="text-[#ff9900] hover:opacity-70 transition-opacity"
                                                >
                                                    TRANSFORMED ↗
                                                </button>
                                            ) : (
                                                <span className="text-gray-500">ORIGINAL</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Traits */}
                                    {nftData.traits && Object.keys(nftData.traits).length > 0 && (
                                        <div className="border border-gray-700">
                                            <div className="py-1 px-2 text-gray-600 text-[9px] border-b border-gray-800">ATTRIBUTES</div>
                                            <div className="py-1.5 px-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
                                                {Object.entries(nftData.traits).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="text-gray-600">{key.toUpperCase()}</span>
                                                        <span className="text-gray-400">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer with links */}
                                    <div className="flex justify-between items-center text-[9px] pt-1 border-t border-gray-800">
                                        <span className="text-gray-700">ENTRY LOGGED</span>
                                        <div className="flex gap-3">
                                            <a
                                                href={`https://magiceden.io/item-details/${nftData.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-500 hover:text-[#ff9900] transition-colors"
                                            >
                                                MARKET ↗
                                            </a>
                                            <a
                                                href={`https://orb.helius.dev/address/${nftData.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-500 hover:text-[#ff9900] transition-colors"
                                            >
                                                EXPLORER ↗
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* State History Modal */}
            {showStateHistory && nftData.pastImage && (
                <div 
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowStateHistory(false)}
                >
                    <div 
                        className="max-w-2xl w-full bg-black border border-gray-700 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-mono text-[10px] text-gray-500">STATE HISTORY</span>
                            <button 
                                onClick={() => setShowStateHistory(false)}
                                className="font-mono text-[10px] text-gray-500 hover:text-[#ff9900]"
                            >
                                CLOSE
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            {/* Previous State */}
                            <div>
                                <div className="relative aspect-square border border-gray-700 bg-black mb-2">
                                    <Image
                                        src={nftData.pastImage}
                                        alt="Previous state"
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                </div>
                                <div className="font-mono text-[10px] text-gray-500">STATE 0</div>
                            </div>
                            
                            {/* Current State */}
                            <div>
                                <div className="relative aspect-square border border-gray-700 bg-black mb-2">
                                    <Image
                                        src={nftData.currentImage}
                                        alt="Current state"
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                </div>
                                <div className="font-mono text-[10px] text-[#ff9900]">STATE 1 — CURRENT</div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700/50">
                            <div className="font-mono text-[10px] text-gray-500">
                                TRANSFORMATION RECORDED
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
