import { useState, useEffect } from 'react'
import Head from 'next/head'
import arweaveData from '../data/arweave-uploads.json'

export default function ZenjakuGallery() {
    const [selectedPiece, setSelectedPiece] = useState(null)
    const [items, setItems] = useState([])

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

    return (
        <>
            <Head>
                <title>The Zenjaku | The Zenjaku Experiment</title>
                <meta name="description" content="The Zenjaku collection. Raw, immutable, eternal." />
            </Head>

            <div className="min-h-screen bg-black text-white pt-16">
                {/* Grid - All items, CryptoPunks style */}
                <div className="grid grid-cols-5 sm:grid-cols-10">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="aspect-square cursor-pointer relative group"
                            onClick={() => setSelectedPiece(item)}
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:brightness-50 transition-all"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-1">
                                <span className="font-mono text-white text-xs font-bold">{item.name}</span>
                                <span className="font-mono text-white/60 text-[6px] mt-1 text-center break-all leading-tight">{item.id}</span>
                            </div>
                        </div>
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

                        <img
                            src={selectedPiece.image}
                            alt={selectedPiece.name}
                            className="w-full aspect-square object-contain mb-4"
                        />

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
