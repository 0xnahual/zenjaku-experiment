import { getSupabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const hoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: sales, error } = await supabase
      .from('sales')
      .select('price')
      .gte('block_time', hoursAgo)

    if (error) throw error

    const totalSales = sales?.length || 0
    const totalVolume = sales?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0
    const avgPrice = totalSales > 0 ? totalVolume / totalSales : 0

    return res.status(200).json({
      avgPrice: avgPrice,
      totalSales: totalSales
    })

  } catch (error) {
    console.error('[Avg Price API] Error:', error)
    return res.status(500).json({ error: 'Failed to fetch avg price' })
  }
}


