import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useDarkMode } from '../contexts/DarkModeContext'
import { burnedNfts } from '../data/burnedNfts'

// This should be moved to a separate config file or fetched from an API
const BURNED_COUNT = 69 // total number of burned NFTs

const totalValueBurned = burnedNfts.reduce((sum, nft) => sum + (nft.burnValue || 0), 0);
const totalCount = burnedNfts.length;

export default function Cemetery() {
    const { isDark, mounted } = useDarkMode()
    const [selectedPiece, setSelectedPiece] = useState(null)
    const [solPrice, setSolPrice] = useState(null)
    const [usdValue, setUsdValue] = useState(null)

    useEffect(() => {
        async function fetchSolPrice() {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const data = await res.json();
                if (data.solana && data.solana.usd) {
                    setSolPrice(data.solana.usd);
                }
            } catch (e) {
                setSolPrice(null);
            }
        }
        fetchSolPrice();
    }, []);

    useEffect(() => {
        if (solPrice !== null) {
            setUsdValue(totalValueBurned * solPrice);
        }
    }, [solPrice, totalValueBurned]);

    if (!mounted) {
        return null
    }

    return (
        <>
            <Head>
                <title>Digital Cemetery | The Zenjaku Experiment</title>
                <meta name="description" content="A memorial for transcended Zenjaku NFTs, forever recorded on the Solana blockchain." />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>

            <div className={`pt-24 px-4 pb-16 min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-16 font-mono text-center">
                        <div
                            className="text-[10px] tracking-[0.5em] uppercase mb-4 opacity-50"
                            style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                        >
                            SOLANA EQUILIBRIUM
                        </div>
                        <h1
                            className="text-3xl font-black tracking-tighter mb-6"
                            style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                        >
                            DIGITAL CEMETERY
                        </h1>
                        <p
                            className="text-sm opacity-70 max-w-2xl mx-auto leading-relaxed mb-2"
                            style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                        >
                            A memorial for Zenjaku NFTs that were burned from the Solana blockchain. Their absence restores balance, their sacrifice is eternal.
                        </p>
                        <p
                            className="text-[10px] font-mono tracking-wider uppercase"
                            style={{ color: isDark ? '#ff9900' : '#ff6600', opacity: 0.8 }}
                        >
                            SACRIFICED // ERASED // REMEMBERED
                        </p>

                        {/* Stats */}
                        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 mt-12">
                            <div className="text-center">
                                <div className={`font-mono text-3xl font-bold tracking-tighter ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}>
                                    {totalValueBurned.toLocaleString()}
                                </div>
                                <div className={`font-mono text-[10px] tracking-widest uppercase opacity-40 mt-1 ${isDark ? 'text-white' : 'text-black'}`}>
                                    SOL TRANSCENDED
                                </div>
                            </div>
                            <div className="hidden sm:block w-px bg-gray-800/20"></div>
                            <div className="text-center">
                                <div className={`font-mono text-3xl font-bold tracking-tighter ${isDark ? 'text-[#ff9900]' : 'text-[#ff6600]'}`}>
                                    {totalCount}
                                </div>
                                <div className={`font-mono text-[10px] tracking-widest uppercase opacity-40 mt-1 ${isDark ? 'text-white' : 'text-black'}`}>
                                    SACRIFICES BURNED
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cemetery Grid */}
                    <div className="border-t border-dashed border-gray-800/50 pt-12">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {burnedNfts.map((artwork) => (
                                <div
                                    key={artwork.id}
                                    className={`group relative aspect-square cursor-pointer transition-all duration-300 ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                                    onClick={() => setSelectedPiece(artwork)}
                                >
                                    <div className={`absolute inset-0 border border-dashed ${isDark ? 'border-gray-800' : 'border-gray-300'} transition-colors group-hover:border-[#ff9900]/50`}></div>

                                    <div className="absolute inset-2 overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{
                                                backgroundImage: `url(${artwork.image})`,
                                                filter: isDark ? 'brightness(0.7) contrast(1.2) grayscale(100%)' : 'brightness(0.9) contrast(1.1) grayscale(100%)',
                                            }}
                                        />
                                        <div className={`absolute inset-0 transition-opacity duration-300 ${isDark ? 'group-hover:opacity-0 bg-black/20' : 'group-hover:opacity-0 bg-black/10'}`} />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60">
                                            <span className="font-mono text-[10px] tracking-widest text-[#ff9900] uppercase">
                                                View
                                            </span>
                                        </div>
                                    </div>

                                    {/* ID Label */}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#ff9900] text-black font-mono text-[8px] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        #{artwork.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Piece Modal */}
            {selectedPiece && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedPiece(null)}
                >
                    <div
                        className="max-w-4xl w-full bg-black border border-dashed border-[#ff9900]/30 p-6 sm:p-12 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 font-mono text-xs text-[#ff9900] hover:text-white transition-colors"
                            onClick={() => setSelectedPiece(null)}
                        >
                            [CLOSE]
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            <div className="aspect-square relative border border-dashed border-gray-800">
                                <div
                                    className="absolute inset-2 bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url(${selectedPiece.image})`,
                                    }}
                                />
                            </div>

                            <div className="font-mono flex flex-col justify-center">
                                <div className="text-[10px] tracking-[0.3em] text-[#ff9900] uppercase mb-2">
                                    TRANSCENDED ARTWORK
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-6">{selectedPiece.title}</h2>

                                <div className="space-y-6 text-sm">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Burn Value</div>
                                        <div className="text-[#ff9900] text-xl font-bold">
                                            {selectedPiece.burnValue} SOL
                                            <span className="text-xs text-gray-500 font-normal ml-2">
                                                (~${(selectedPiece.burnValue * (solPrice || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Burn Date</div>
                                            <div className="text-white">{selectedPiece.burnDate}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Block</div>
                                            <div className="text-white">#{selectedPiece.burnBlock || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Mint Address</div>
                                        <div className="text-xs text-gray-400 break-all font-mono">
                                            {selectedPiece.mintAddress}
                                        </div>
                                    </div>

                                    <div className="pt-6 flex gap-4">
                                        <a
                                            href={`https://solscan.io/token/${selectedPiece.mintAddress}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] uppercase tracking-widest text-[#ff9900] hover:text-white border-b border-[#ff9900] hover:border-white pb-0.5 transition-colors"
                                        >
                                            View on Solscan
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
} 