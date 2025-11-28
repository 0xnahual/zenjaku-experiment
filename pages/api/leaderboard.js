export default async function handler(req, res) {
    // Default to 'zenjaku' if not specified
    const collectionSymbol = 'vibe_knights'

    try {
        // Fetch activities from Magic Eden
        // We want a large limit to get a good sample size for the leaderboard
        // Note: In a production app, we would paginate through all history or cache this data.
        const response = await fetch(
            `https://api-mainnet.magiceden.dev/v2/collections/${collectionSymbol}/activities?limit=100`
        )

        if (!response.ok) {
            throw new Error(`Magic Eden API responded with ${response.status}`)
        }

        const activities = await response.json()
        console.log(`Fetched ${activities.length} activities for ${collectionSymbol}`)

        // Aggregate volume by wallet
        const walletVolumes = {}

        activities.forEach(activity => {
            // We care about realized trades
            if (activity.type === 'buyNow' || activity.type === 'acceptBid') {
                const price = activity.price || 0

                // Attribute volume to Buyer
                if (activity.buyer) {
                    walletVolumes[activity.buyer] = (walletVolumes[activity.buyer] || 0) + price
                }

                // Attribute volume to Seller? 
                // Usually leaderboards might separate them or combine. 
                // Let's combine for "Total Volume Traded"
                if (activity.seller) {
                    walletVolumes[activity.seller] = (walletVolumes[activity.seller] || 0) + price
                }
            }
        })

        // Convert to array and sort
        const leaderboard = Object.entries(walletVolumes)
            .map(([address, volume]) => ({
                address,
                volume,
                // Placeholder avatar logic
                avatar: address.slice(0, 2).toUpperCase()
            }))
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 50) // Top 50

        // Add ranks
        leaderboard.forEach((item, index) => {
            item.rank = index + 1
        })

        res.status(200).json(leaderboard)
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        res.status(500).json({ error: 'Failed to fetch leaderboard data' })
    }
}
