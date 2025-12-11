import { useEffect } from 'react'
import { useRouter } from 'next/router'
import arweaveData from '../../data/arweave-uploads.json'

// Build items the same way explorer does
const items = Object.entries(arweaveData).map(([filename, url], index) => ({
    tokenNumber: index + 1,
    mintAddress: filename.replace('.png', '')
}))

export default function CollectRedirect() {
    const router = useRouter()
    const { address } = router.query

    useEffect(() => {
        if (!address) return

        let mintAddress = address

        // Check if address is a number (token ID)
        if (/^\d+$/.test(address)) {
            const tokenNum = parseInt(address, 10)
            const found = items.find(item => item.tokenNumber === tokenNum)
            if (found) {
                mintAddress = found.mintAddress
            }
        }

        // Redirect to Magic Eden
        window.location.href = `https://magiceden.io/item-details/${mintAddress}`
    }, [address])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-[#ff9900] font-mono text-xs animate-pulse">
                REDIRECTING TO MAGIC EDEN...
            </div>
        </div>
    )
}
