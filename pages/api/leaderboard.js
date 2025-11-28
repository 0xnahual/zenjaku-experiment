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
      // Added 'seller' to the selection so we can credit them too
      .select('buyer, seller, price, block_time')

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
          const price = Number(sale.price) || 0
          const credit = price * 0.5

          // Credit the BUYER (50% of volume)
          if (sale.buyer) {
            volumeByWallet[sale.buyer] = (volumeByWallet[sale.buyer] || 0) + credit
          }

          // Credit the SELLER (50% of volume)
          if (sale.seller) {
            volumeByWallet[sale.seller] = (volumeByWallet[sale.seller] || 0) + credit
          }
        })
    }

    // Transform to array
    const leaderboard = Object.entries(volumeByWallet)
      .map(([address, volume]) => {
        const vol = Number(volume);
        // 0.69% total royalties, split between charity and burn (0.345% each)
        const royaltyShare = 0.00345; 
        return {
            address,
            volume: Number(vol.toFixed(4)),
            donated: Number((vol * royaltyShare).toFixed(5)),
            burned: Number((vol * royaltyShare).toFixed(5)),
            avatar: address.slice(0, 2).toUpperCase()
        };
      })
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
