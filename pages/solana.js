import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Head from 'next/head'
import arweaveData from '../data/arweave-uploads.json'

export default function ZenjakuGallery() {
    const [selectedPiece, setSelectedPiece] = useState(null)
    const [items, setItems] = useState([])
    const [autoScrollActive, setAutoScrollActive] = useState(true)
    const gridRef = useRef(null)

    useEffect(() => {
        const loadedItems = Object.entries(arweaveData).map(([filename, url], index) => {
            const id = filename.replace('.png', '')
            return {
                index: index + 1,
                id: id,
                filename: filename,
                image: url,
                name: `#${(index + 1).toString().padStart(3, '0')}`,
            }
        })
        setItems(loadedItems)
    }, [])

    // Auto-scroll effect
    useEffect(() => {
        if (!autoScrollActive) return

        const scrollSpeed = 0.5 // pixels per frame
        let animationId

        const scroll = () => {
            if (!autoScrollActive) return
            window.scrollBy(0, scrollSpeed)
            animationId = requestAnimationFrame(scroll)
        }

        // Start scrolling after a short delay
        const timeout = setTimeout(() => {
            animationId = requestAnimationFrame(scroll)
        }, 500)

        return () => {
            clearTimeout(timeout)
            if (animationId) cancelAnimationFrame(animationId)
        }
    }, [autoScrollActive])

    // Stop auto-scroll on any interaction
    const stopAutoScroll = () => {
        if (autoScrollActive) setAutoScrollActive(false)
    }

    useEffect(() => {
        // Stop on manual scroll
        const handleWheel = () => stopAutoScroll()
        const handleTouchStart = () => stopAutoScroll()
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space'].includes(e.code)) {
                stopAutoScroll()
            }
        }

        window.addEventListener('wheel', handleWheel, { passive: true })
        window.addEventListener('touchstart', handleTouchStart, { passive: true })
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('wheel', handleWheel)
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [autoScrollActive])

    return (
        <>
            <Head>
                <title>The Zenjaku | The Zenjaku Experiment</title>
                <meta name="description" content="The Zenjaku collection. Raw, immutable, eternal." />
            </Head>

            <div className="min-h-screen bg-black text-white pt-16">
                {/* Grid - All items, CryptoPunks style */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-5 sm:grid-cols-10"
                    onMouseEnter={stopAutoScroll}
                    onMouseLeave={() => setAutoScrollActive(true)}
                >
                    {items.map((item) => (
                        <ZenjakuItem
                            key={item.id}
                            item={item}
                            onClick={setSelectedPiece}
                        />
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedPiece && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPiece(null)}
                >
                    <div
                        className="max-w-lg w-full relative bg-black text-white"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute -top-8 right-0 font-mono text-sm hover:text-[#ff9900]"
                            onClick={() => setSelectedPiece(null)}
                        >
                            CLOSE
                        </button>

                        <div className="relative w-full aspect-square mb-4">
                            <Image
                                src={selectedPiece.image}
                                alt={selectedPiece.name}
                                className="object-contain"
                                fill
                                sizes="(max-width: 768px) 100vw, 600px"
                                priority
                            />
                        </div>

                        <div className="font-mono text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[#ff9900]">{selectedPiece.name}</span>
                                <span className="opacity-50">ARWEAVE</span>
                            </div>
                            <div className="text-[10px] opacity-40 break-all">
                                {selectedPiece.id}
                            </div>
                            <a
                                href={selectedPiece.image}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-4 text-xs hover:text-[#ff9900] transition-colors"
                            >
                                VIEW FULL SIZE →
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function ZenjakuItem({ item, onClick }) {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div
            className="aspect-square cursor-pointer relative group bg-white/5"
            onClick={() => onClick(item)}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 border border-white/20 border-t-[#ff9900] rounded-full animate-spin" />
                </div>
            )}
            <Image
                src={item.image}
                alt={item.name}
                className={`object-cover transition-all duration-300 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100 group-hover:brightness-50'
                    }`}
                fill
                sizes="(max-width: 640px) 20vw, 10vw"
                onLoadingComplete={() => setIsLoading(false)}
            />
            <div className={`absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-1 z-10 ${isLoading ? 'hidden' : ''}`}>
                <span className="font-mono text-white text-xs font-bold">{item.name}</span>
                <span className="font-mono text-white/60 text-[6px] mt-1 text-center break-all leading-tight">{item.id}</span>
            </div>
        </div>
    )
}
