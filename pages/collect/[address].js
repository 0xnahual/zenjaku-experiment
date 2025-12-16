import { useEffect } from 'react'
import { useRouter } from 'next/router'
import zenjakuMapping from '../../data/zenjaku-mapping.json'

export default function CollectRedirect() {
    const router = useRouter()
    const { address } = router.query

    useEffect(() => {
        if (!address) return

        let mintAddress = address

        // Check if address is a number (token ID)
        if (/^\d+$/.test(address)) {
            const tokenNum = parseInt(address, 10)
            if (zenjakuMapping[tokenNum]) {
                mintAddress = zenjakuMapping[tokenNum].address
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





