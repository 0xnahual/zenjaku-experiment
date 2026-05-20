import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
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
                    <div className="text-[#ff9900] font-mono text-xs animate-pulse">LOADING...</div>
                </div>
            </div>
        )
    }

    const hasPrev = nftData.tokenNumber > 1
    const hasNext = nftData.tokenNumber < allItems.length

    return (
        <>
            <Head>
                <title>Zenjaku {nftData.name} | Explorer</title>
                <meta name="description" content={`Zenjaku ${nftData.name} - View on-chain details`} />
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
                                    <div className="relative aspect-square border border-gray-800 bg-[#0a0a0a]">
                                        <Image
                                            src={nftData.currentImage}
                                            alt={nftData.name}
                                            fill
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                    </div>
                                    {nftData.pastImage && (
                                        <div className="mt-4 flex items-center gap-4">
                                            <div className="relative w-20 h-20 border border-gray-800 bg-[#0a0a0a]">
                                                <Image
                                                    src={nftData.pastImage}
                                                    alt="Before"
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="text-gray-600 font-mono text-xs">
                                                <div className="text-gray-400">PREVIOUS STATE</div>
                                                <div className="text-[#ff9900]">→ TRANSFORMED</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Details */}
                                <div className="font-mono text-xs space-y-6">
                                    {/* Title with inline navigation */}
                                    <div>
                                        <div className="text-gray-500 mb-1">ZENJAKU</div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handlePrev}
                                                disabled={!hasPrev}
                                                className={`text-lg ${hasPrev ? 'text-[#ff9900] hover:opacity-70' : 'text-gray-700 cursor-not-allowed'}`}
                                            >
                                                ←
                                            </button>
                                            <form onSubmit={handleInputSubmit} className="flex items-center">
                                                <input
                                                    type="text"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="w-16 bg-transparent text-4xl font-black text-[#ff9900] text-center focus:outline-none"
                                                />
                                            </form>
                                            <button
                                                onClick={handleNext}
                                                disabled={!hasNext}
                                                className={`text-lg ${hasNext ? 'text-[#ff9900] hover:opacity-70' : 'text-gray-700 cursor-not-allowed'}`}
                                            >
                                                →
                                            </button>
                                            <span className="text-gray-600 text-sm">/ {allItems.length}</span>
                                        </div>
                                    </div>

                                    {/* On-Chain Data */}
                                    <div className="border border-gray-800 divide-y divide-gray-800">
                                        <div className="flex justify-between p-3">
                                            <span className="text-gray-500">TOKEN ID</span>
                                            <span className="text-white">{nftData.tokenNumber}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-gray-500">MINT ADDRESS</span>
                                            <span className="text-[#ff9900] text-[10px] break-all">{nftData.id}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-gray-500">BLOCKCHAIN</span>
                                            <span className="text-white">SOLANA</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-gray-500">STATUS</span>
                                            <span className="text-green-500">● LIVE</span>
                                        </div>
                                    </div>

                                    {/* External Links */}
                                    <div className="space-y-2">
                                        <div className="text-gray-500 mb-2">VERIFY ON-CHAIN</div>
                                        <a
                                            href={`https://magiceden.io/item-details/${nftData.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-3 border border-[#ff9900] text-[#ff9900] hover:bg-[#ff9900] hover:text-black transition-colors"
                                        >
                                            VIEW ON MARKET →
                                        </a>
                                        <a
                                            href={`https://orb.helius.dev/address/${nftData.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-3 border border-gray-700 text-gray-400 hover:border-[#ff9900] hover:text-[#ff9900] transition-colors"
                                        >
                                            VIEW ON EXPLORER →
                                        </a>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-gray-600 text-[10px] pt-4 border-t border-gray-800">
                                        <div>THE ZENJAKU EXPERIMENT</div>
                                        <div>禅衡者实验 | ON-CHAIN • IMMUTABLE • ETERNAL</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
