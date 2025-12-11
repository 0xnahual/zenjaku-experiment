import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Head from 'next/head'
import arweaveData from '../../data/arweave-uploads.json'
import pastImages from '../../data/past_image_urls.json'
import Header from '../../components/Header'
import { useDarkMode } from '../../contexts/DarkModeContext'

export default function Explorer() {
    const router = useRouter()
    const { id } = router.query
    const { mounted } = useDarkMode()
    const [nftData, setNftData] = useState(null)
    const [allItems, setAllItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [inputValue, setInputValue] = useState('')
    const [showStateHistory, setShowStateHistory] = useState(false)

    useEffect(() => {
        const items = Object.entries(arweaveData).map(([filename, url], index) => {
            const nftId = filename.replace('.png', '')
            const tokenNumber = index + 1
            return {
                tokenNumber: tokenNumber,
                id: nftId,
                currentImage: url,
                pastImage: pastImages[nftId] || null,
                name: `#${tokenNumber.toString().padStart(4, '0')}`
            }
        })
        setAllItems(items)
    }, [])

    useEffect(() => {
        if (!id || allItems.length === 0) return
        const tokenNum = parseInt(id)
        const found = allItems.find(item => item.tokenNumber === tokenNum)
        if (found) {
            setNftData(found)
            setInputValue(tokenNum.toString())
        }
        setIsLoading(false)
    }, [id, allItems])

    const handlePrev = () => {
        if (!nftData) return
        const prevNum = nftData.tokenNumber - 1
        if (prevNum >= 1) router.push(`/explorer/${prevNum}`)
    }

    const handleNext = () => {
        if (!nftData) return
        const nextNum = nftData.tokenNumber + 1
        if (nextNum <= allItems.length) router.push(`/explorer/${nextNum}`)
    }

    const handleInputSubmit = (e) => {
        e.preventDefault()
        const num = parseInt(inputValue)
        if (num >= 1 && num <= allItems.length) {
            router.push(`/explorer/${num}`)
        }
    }

    if (!mounted || isLoading || !nftData) {
        return (
            <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-[#ff9900] font-mono text-xs animate-pulse">INDEXING...</div>
                </div>
            </div>
        )
    }

    const hasPrev = nftData.tokenNumber > 1
    const hasNext = nftData.tokenNumber < allItems.length

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
                                <div className="font-mono text-xs space-y-6">
                                    {/* Navigation */}
                                    <div>
                                        <div className="text-gray-500 text-[10px] mb-2">ENTITY</div>
                                        <div className="flex items-center gap-3">
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
                                                    className="w-16 bg-transparent text-3xl font-light text-[#ff9900] text-center focus:outline-none"
                                                />
                                            </form>
                                            <button
                                                onClick={handleNext}
                                                disabled={!hasNext}
                                                className={`text-sm ${hasNext ? 'text-[#ff9900] hover:opacity-70' : 'text-gray-700 cursor-not-allowed'}`}
                                            >
                                                →
                                            </button>
                                            <span className="text-gray-500 text-[10px]">/ {allItems.length}</span>
                                        </div>
                                    </div>

                                    {/* Parameters */}
                                    <div className="border border-gray-700 divide-y divide-gray-700">
                                        <div className="flex justify-between p-3">
                                            <span className="text-gray-500">INDEX</span>
                                            <span className="text-gray-300">{nftData.tokenNumber}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-gray-500">ADDRESS</span>
                                            <span className="text-[#ff9900]/70 text-[10px] break-all">{nftData.id}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-gray-500">CHAIN</span>
                                            <span className="text-gray-300">SOLANA</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-gray-500">SIGNAL</span>
                                            <span className="text-gray-300">ACTIVE</span>
                                        </div>
                                        <div className="flex justify-between p-3">
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

                                    {/* System Line */}
                                    <div className="text-gray-500 text-[10px] py-2 border-y border-gray-700/50">
                                        SIGNAL: ACTIVE — PARAMETERS LOGGED
                                    </div>

                                    {/* External Links */}
                                    <div className="flex gap-4 text-[10px]">
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

                                    {/* Footer */}
                                    <div className="text-gray-600 text-[10px] pt-4">
                                        ENTRY RECORDED IN CORE ARCHIVE
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
