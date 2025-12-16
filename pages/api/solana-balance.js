export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { address } = req.query

  if (!address) {
    return res.status(400).json({ error: 'Address is required' })
  }

  // Validate Solana address format (base58, 32-44 chars)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana address format' })
  }

  try {
    // Use public Solana RPC endpoint
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
      }),
    })

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || 'RPC error')
    }

    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    const lamports = data.result?.value || 0
    const sol = lamports / 1_000_000_000

    return res.status(200).json({
      address,
      balance: sol,
      lamports,
    })

  } catch (error) {
    console.error('[Solana Balance API] Error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch balance', 
      details: error.message 
    })
  }
}
