import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  try {
    // Get sales from last 12 hours via Supabase REST API
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/sales?select=buyer,seller,price,block_time&block_time=gte.${twelveHoursAgo}&order=block_time.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )
    
    if (!response.ok) throw new Error('Failed to fetch sales')
    
    const sales = await response.json()

    // Calculate stats
    const totalSales = sales?.length || 0
    const totalVolume = sales?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0
    const uniqueBuyers = new Set(sales?.map(s => s.buyer).filter(Boolean)).size
    const uniqueSellers = new Set(sales?.map(s => s.seller).filter(Boolean)).size

    // Get top 5 by volume
    const volumeByWallet = {}
    sales?.forEach(sale => {
      const price = Number(sale.price) || 0
      if (sale.buyer) volumeByWallet[sale.buyer] = (volumeByWallet[sale.buyer] || 0) + price * 0.5
      if (sale.seller) volumeByWallet[sale.seller] = (volumeByWallet[sale.seller] || 0) + price * 0.5
    })
    
    const top5 = Object.entries(volumeByWallet)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([address, volume], i) => ({ rank: i + 1, address, volume }))

    const now = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    })

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000',
            padding: '40px',
            fontFamily: 'monospace',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#666', fontSize: '14px', letterSpacing: '0.3em' }}>THE ZENJAKU EXPERIMENT</span>
              <span style={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}>12H REPORT</span>
            </div>
            <span style={{ color: '#444', fontSize: '12px' }}>{now}</span>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#111', padding: '20px', borderLeft: '2px solid #ff9900' }}>
              <span style={{ color: '#666', fontSize: '10px', letterSpacing: '0.2em' }}>TOTAL SALES</span>
              <span style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>{totalSales}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#111', padding: '20px', borderLeft: '2px solid #ff9900' }}>
              <span style={{ color: '#666', fontSize: '10px', letterSpacing: '0.2em' }}>VOLUME (SOL)</span>
              <span style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>{totalVolume.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#111', padding: '20px', borderLeft: '2px solid #333' }}>
              <span style={{ color: '#666', fontSize: '10px', letterSpacing: '0.2em' }}>UNIQUE TRADERS</span>
              <span style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>{uniqueBuyers + uniqueSellers}</span>
            </div>
          </div>

          {/* Top Traders */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ color: '#666', fontSize: '12px', letterSpacing: '0.2em', marginBottom: '15px' }}>TOP TRADERS (12H)</span>
            {top5.length === 0 ? (
              <span style={{ color: '#444', fontSize: '14px' }}>No trades in the last 12 hours</span>
            ) : (
              top5.map((trader) => (
                <div key={trader.address} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #222' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: '#ff9900', fontSize: '14px', width: '30px' }}>#{trader.rank}</span>
                    <span style={{ color: '#888', fontSize: '12px' }}>{trader.address.slice(0, 8)}...{trader.address.slice(-6)}</span>
                  </div>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{trader.volume.toFixed(2)} SOL</span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #222' }}>
            <span style={{ color: '#333', fontSize: '10px' }}>SIGNAL: ACTIVE — DATA ON-CHAIN</span>
            <span style={{ color: '#333', fontSize: '10px' }}>zenjaku.xyz</span>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 500,
      }
    )
  } catch (error) {
    console.error('Report image error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
