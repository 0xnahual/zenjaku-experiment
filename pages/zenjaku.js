import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'
import arweaveData from '../data/arweave-uploads.json'

export default function ZenjakuGallery() {
    const { isDark, glitchActive, mounted } = useDarkMode()
    const [selectedPiece, setSelectedPiece] = useState(null)
    const [items, setItems] = useState([])

    useEffect(() => {
        // Transform the simple key-value JSON into an array of objects
        const loadedItems = Object.entries(arweaveData).map(([filename, url], index) => {
            // Extract a "token ID" or hash from the filename if possible, or just use index
            // Filename format seems to be: <hash>.png
            const id = filename.replace('.png', '')
            return {
                index: index + 1,
                id: id,
                filename: filename,
                image: url,
                // Placeholder metadata until real metadata is available
                name: `Zenjaku #${index + 1}`,
                description: 'A Zenjaku from the void.',
            }
        })
        setItems(loadedItems)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <>
            <Head>
                <title>The Zenjaku | The Zenjaku Experiment</title>
                <meta name="description" content="The Zenjaku collection. Raw, immutable, eternal." />
            </Head>

            <div className={`min-h-screen pt-24 px-4 pb-16 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
                <div className="max-w-[1600px] mx-auto">
                    {/* Header Section */}
                    <div className="mb-12 border-b border-current pb-8">
                        <h1
                            className="text-4xl md:text-6xl font-mono font-black tracking-tighter mb-4 uppercase"
                            style={{
                                textShadow: glitchActive ? '2px 2px #ff0000, -2px -2px #00ff00' : 'none'
                            }}
                        >
                            The Zenjaku
                        </h1>
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                            <p className="font-mono text-sm md:text-base opacity-70 max-w-2xl">
                                {items.length} unique entities stored permanently on Arweave.
                                <br />
                                <span className="text-xs opacity-50">METADATA SYNC: PENDING...</span>
                            </p>
                            <div className="font-mono text-xs tracking-widest uppercase border border-current px-4 py-2">
                                STATUS: ONLINE
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group relative cursor-pointer"
                                onClick={() => setSelectedPiece(item)}
                            >
                                <div className="aspect-square bg-gray-900 relative overflow-hidden border border-transparent group-hover:border-[#ff9900] transition-colors">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        style={{
                                            filter: isDark ? 'brightness(0.9)' : 'none'
                                        }}
                                        loading="lazy"
                                    />

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </div>

                                <div className="mt-2 font-mono text-[9px] flex flex-col gap-1 opacity-70 group-hover:opacity-100 group-hover:text-[#ff9900]">
                                    <span className="font-bold">#{item.index}</span>
                                    <span className="break-all leading-tight">{item.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedPiece && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedPiece(null)}
                >
                    <div
                        className={`max-w-4xl w-full p-6 md:p-8 relative border ${isDark ? 'bg-black border-gray-800' : 'bg-white border-black'}`}
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
