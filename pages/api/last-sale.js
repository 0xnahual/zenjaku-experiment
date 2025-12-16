import { getSupabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = getSupabaseAdmin()
    
    const { data: sale, error } = await supabase
      .from('sales')
      .select('price, block_time')
      .order('block_time', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    return res.status(200).json({
      price: sale?.price || 0,
      timestamp: sale?.block_time || null
    })

  } catch (error) {
    console.error('[Last Sale API] Error:', error)
    return res.status(500).json({ error: 'Failed to fetch last sale' })
  }
}
