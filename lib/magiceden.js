import axios from 'axios'
import https from 'https'

const BASE_URL = 'https://api-mainnet.magiceden.dev/v2'

const httpsAgent = new https.Agent({
    rejectUnauthorized: false, 
    insecureHTTPParser: true,
    keepAlive: true
});

export async function fetchCollectionActivities(symbol, options = {}) {
  const { limit = 10000 } = options 
  let allActivities = []
  let offset = 0
  let keepFetching = true
  const BATCH_SIZE = 500
  const MAX_ITERATIONS = 50 

  console.log(`[MagicEden] Starting fetch for ${symbol}...`)
  let iterations = 0

  while (keepFetching && iterations < MAX_ITERATIONS) {
    try {
      const url = `${BASE_URL}/collections/${symbol}/activities`
      console.log(`[MagicEden] Fetching batch at offset ${offset}...`)
      
      const res = await axios.get(url, {
        params: {
          offset,
          limit: BATCH_SIZE
        },
        httpsAgent,
        responseType: 'arraybuffer', 
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Node/Axios'
        },
        validateStatus: () => true
      })

      if (res.status >= 400) {
          console.error(`[MagicEden] API Error ${res.status}`)
          throw new Error(`API Error ${res.status}`)
      }

      // Manual decode
      let data;
      try {
          const raw = res.data.toString('utf8');
          data = JSON.parse(raw);
      } catch(e) {
          console.error('[MagicEden] Parse error', e.message);
          throw new Error('Invalid JSON');
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        keepFetching = false
        break
      }

      allActivities = [...allActivities, ...data]
      
      if (data.length < BATCH_SIZE || allActivities.length >= limit) {
        keepFetching = false
      } else {
        offset += data.length
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      iterations++
    } catch (err) {
      console.error('[MagicEden] Fetch error:', err.message)
      if (allActivities.length > 0) return allActivities
      throw new Error(err.message); 
    }
  }

  console.log(`[MagicEden] Fetched total ${allActivities.length} activities`)
  return allActivities
}

// Helper to sanitize strings for Postgres/Supabase
function sanitizeString(str) {
    if (!str) return str;
    // Remove non-printable ASCII characters and other weirdness if necessary.
    // But for "ByteString" error, usually ensuring it's valid UTF-8 is enough.
    // The error actually comes from headers usually, but if it's in the body, 
    // supabase-js might be putting it in a header?
    // Let's just strip high ascii to be absolutely safe for now if we want to kill the error.
    // Or just ensure it's a string.
    return String(str).replace(/[^\x20-\x7E]/g, ''); // Aggressive: Keep only printable ASCII
}

export function processActivitiesForDB(activities, symbol) {
  return activities
    .filter(activity => 
      (activity.type === 'buyNow' || activity.type === 'acceptBid') && 
      activity.buyer && 
      activity.signature 
    )
    .map(activity => {
        // Sanitize everything to prevent "ByteString" crashes in supabase-js
        return {
            signature: sanitizeString(activity.signature),
            collection_symbol: sanitizeString(symbol),
            buyer: sanitizeString(activity.buyer),
            seller: sanitizeString(activity.seller),
            price: activity.price || 0,
            block_time: activity.blockTime ? new Date(activity.blockTime * 1000).toISOString() : new Date().toISOString(),
            source: 'magiceden'
        };
    })
}
