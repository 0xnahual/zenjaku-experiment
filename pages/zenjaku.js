import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import arweaveData from '../data/arweave-uploads.json'

const ITEMS_PER_BATCH = 48

export default function ZenjakuGallery() {
    const [selectedPiece, setSelectedPiece] = useState(null)
    const [allItems, setAllItems] = useState([])
    const [visibleItems, setVisibleItems] = useState([])
    const [loading, setLoading] = useState(false)
    const loaderRef = useRef(null)

    // Load all items data on mount
    useEffect(() => {
        const loadedItems = Object.entries(arweaveData).map(([filename, url], index) => {
            const id = filename.replace('.png', '')
            return {
                index: index + 1,
                id: id,
                filename: filename,
                image: url,
                name: `#${(index + 1).toString().padStart(3, '0')}`,
                description: 'A Zenjaku from the void.',
            }
        })
        setAllItems(loadedItems)
        // Load first batch
        setVisibleItems(loadedItems.slice(0, ITEMS_PER_BATCH))
    }, [])

    // Load more items
    const loadMore = useCallback(() => {
        if (loading || visibleItems.length >= allItems.length) return
        
        setLoading(true)
        // Small delay for smooth loading effect
        setTimeout(() => {
            const nextBatch = allItems.slice(
                visibleItems.length,
                visibleItems.length + ITEMS_PER_BATCH
            )
            setVisibleItems(prev => [...prev, ...nextBatch])
            setLoading(false)
        }, 100)
    }, [loading, visibleItems.length, allItems])

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => observer.disconnect()
    }, [loadMore])

    return (
        <>
            <Head>
                <title>The Zenjaku | The Zenjaku Experiment</title>
                <meta name="description" content="The Zenjaku collection. Raw, immutable, eternal." />
            </Head>

            <div className="min-h-screen bg-black text-white">
                {/* Floating Header */}
                <div className="fixed top-20 left-6 z-30 mix-blend-difference pointer-events-none">
                    <div className="font-mono text-[10px] tracking-[0.5em] text-white/40 mb-1">禅衡者</div>
                    <div className="text-[11px] font-mono tracking-[0.2em] text-white/60">
                        {allItems.length > 0 && <span className="text-white">{allItems.length}</span>} STORED FOREVER
                    </div>
                </div>

                {/* Grid - Full Bleed */}
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 2xl:grid-cols-15">
                    {visibleItems.map((item) => (
                        <div
                            key={item.id}
                            className="aspect-square cursor-pointer relative overflow-hidden group"
                            onClick={() => setSelectedPiece(item)}
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-[#ff9900]/0 group-hover:bg-[#ff9900]/10 transition-colors duration-300" />
                        </div>
                    ))}
                </div>

                {/* Loader */}
                {visibleItems.length < allItems.length && (
                    <div 
                        ref={loaderRef} 
                        className="h-20 flex items-center justify-center"
                    >
                        <div className="w-1 h-1 bg-[#ff9900] animate-ping" />
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedPiece && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedPiece(null)}
                >
                    <div
                        className="max-w-5xl w-full p-1 relative border bg-black border-[#ff9900]/30 text-white"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 font-mono text-xl hover:text-[#ff9900]"
                            onClick={() => setSelectedPiece(null)}
                        >
                            [X]
                        </button>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/2 aspect-square bg-gray-900">
                                <img
                                    src={selectedPiece.image}
                                    alt={selectedPiece.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="w-full md:w-1/2 font-mono flex flex-col justify-between">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2 uppercase text-[#ff9900]">
                                        {selectedPiece.name}
                                    </h2>
                                    <div className="w-full h-px bg-current opacity-20 my-4" />

                                    <div className="space-y-4 text-xs md:text-sm">
                                        <div className="grid grid-cols-3 gap-2">
                                            <span className="opacity-50">FILENAME</span>
                                            <span className="col-span-2 break-all">{selectedPiece.filename}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <span className="opacity-50">ARWEAVE ID</span>
                                            <span className="col-span-2 break-all text-[#ff9900]">
                                                {selectedPiece.image.split('/').pop()}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <span className="opacity-50">HASH</span>
                                            <span className="col-span-2 break-all opacity-70">{selectedPiece.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-current border-opacity-20">
                                    <div className="flex justify-between items-center border-b border-current border-opacity-20 pb-1 mb-1">
                                        <span className="font-bold">#{selectedPiece.index.toString().padStart(3, '0')}</span>
                                        <span>SUBJECT</span>
                                    </div>
                                    <a
                                        href={selectedPiece.image}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-[#ff9900] text-black px-4 py-2 text-xs font-bold uppercase hover:bg-[#ffaa00] transition-colors"
                                    >
                                        View Original
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
