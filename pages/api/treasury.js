const TREASURY_ADDRESS = '6scYfnYS2bQxNG9sXohtHpndNbtutotBdgxcvftzUxrr'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

  try {
    const [balanceRes, priceRes] = await Promise.all([
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [TREASURY_ADDRESS]
        })
      }).then(r => r.json()),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        .then(r => r.json())
    ])

    const lamports = Number(balanceRes?.result?.value ?? 0)
    const balanceSOL = lamports / 1e9
    const priceUSD = Number(priceRes?.solana?.usd ?? 0)
    const balanceUSD = balanceSOL * priceUSD

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.status(200).json({
      address: TREASURY_ADDRESS,
      balanceSOL,
      priceUSD,
      balanceUSD
    })
  } catch (error) {
    console.error('[Treasury API] Error:', error)
    return res.status(500).json({ error: 'Failed to fetch treasury balance', details: error.message })
  }
}
