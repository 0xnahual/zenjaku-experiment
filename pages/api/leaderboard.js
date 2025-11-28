import { getSupabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { timeframe } = req.query // 'daily', 'monthly', 'allTime'

  try {
    // Use the admin client since we know the Service Role Key is working correctly
    // and the Anon key seems to be having issues in the env file.
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('sales')
      .select('buyer, price, block_time')

    // Apply Time Filters
    const now = new Date()
    if (timeframe === 'daily') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('block_time', oneDayAgo)
    } else if (timeframe === 'monthly') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('block_time', thirtyDaysAgo)
    }
    // 'allTime' needs no filter

    const { data: sales, error } = await query

    if (error) {
        console.error('Supabase Query Error:', error)
        throw error
    }

    // Aggregate in memory (efficient enough for <10k sales)
    const volumeByWallet = {}

    if (sales && sales.length > 0) {
        sales.forEach(sale => {
          if (sale.buyer) {
            volumeByWallet[sale.buyer] = (volumeByWallet[sale.buyer] || 0) + Number(sale.price)
          }
        })
    }

    // Transform to array
    const leaderboard = Object.entries(volumeByWallet)
      .map(([address, volume]) => ({
        address,
        volume: Number(volume.toFixed(4)), // 4 decimals is usually enough for SOL
        avatar: address.slice(0, 2).toUpperCase()
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 50) // Top 50

    // Add ranks
    leaderboard.forEach((item, index) => {
      item.rank = index + 1
    })

    // Cache control: shorter cache for daily stats
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

    return res.status(200).json(leaderboard)

  } catch (error) {
    console.error('[Leaderboard API] Error:', error)
    return res.status(500).json({ error: 'Failed to load leaderboard', details: error.message })
  }
}
