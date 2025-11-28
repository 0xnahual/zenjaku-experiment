export default async function handler(req, res) {
    const { address } = req.query

    if (!address) {
        return res.status(400).json({ error: 'Address is required' })
    }

    try {
        // Fetch activities from Magic Eden
        // Limit to 500 to get a good chunk of history
        const response = await fetch(
            `https://api-mainnet.magiceden.dev/v2/wallets/${address}/activities?limit=500`
        )

        if (!response.ok) {
            throw new Error(`Magic Eden API responded with ${response.status}`)
        }

        const activities = await response.json()

        // Calculate total volume
        // We sum up the price of all 'buy' and 'sell' activities
        // Note: This is a simplified volume calculation. 
        // For a perfect "trading volume", we might want to filter more strictly.
        let totalVolume = 0

        activities.forEach(activity => {
            if (activity.type === 'buyNow' || activity.type === 'bid' || activity.type === 'list') {
                // For now, let's just count realized trades if possible, but 'buyNow' is a good proxy for purchase volume.
                // 'list' is intent, not volume.
                // Let's look for 'buyNow' (purchase) and 'acceptBid' (sale) if they exist, 
                // or just sum 'price' if the activity represents a transaction.

                // Common ME activity types: 'buyNow', 'list', 'delist', 'bid', 'cancelBid', 'acceptBid'
                if (activity.type === 'buyNow' || activity.type === 'acceptBid') {
                    totalVolume += activity.price || 0
                }
            }
        })

        res.status(200).json({ volume: totalVolume })
    } catch (error) {
        console.error('Error fetching volume:', error)
        res.status(500).json({ error: 'Failed to fetch volume data' })
    }
}
