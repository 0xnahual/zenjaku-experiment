import { getSupabaseAdmin } from '../../lib/supabase'
import { fetchCollectionActivities, processActivitiesForDB } from '../../lib/magiceden'

export default async function handler(req, res) {
  // 1. Security Check
  const authHeader = req.headers.authorization
  const expectedAuth = `Bearer ${process.env.SYNC_SECRET_KEY}`

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (authHeader !== expectedAuth) {
    console.warn('Unauthorized sync attempt')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // 2. Initialize Admin Client
    const supabaseAdmin = getSupabaseAdmin()

    // 3. Fetch Data from Magic Eden
    const COLLECTION_SYMBOL = 'vibe_knights'
    
    let activities = []
    try {
         // Increase limit to 10000 to get more history.
         // The fetchCollectionActivities helper handles pagination automatically up to this limit.
         activities = await fetchCollectionActivities(COLLECTION_SYMBOL, { limit: 10000 })
    } catch (fetchErr) {
        // Only log the message, not the full object which might contain the toxic header
        console.error('[Sync] Fetching failed:', fetchErr.message);
        return res.status(500).json({ error: 'Failed to fetch data from Magic Eden: ' + fetchErr.message })
    }

    // 4. Process Data for DB
    const salesEvents = processActivitiesForDB(activities, COLLECTION_SYMBOL)
    
    console.log(`[Sync] Prepare to upsert ${salesEvents.length} sales events`)

    if (salesEvents.length === 0) {
        return res.status(200).json({ message: 'No new sales found' })
    }

    // 5. Upsert to 'sales' table (Batching)
    const BATCH_SIZE = 100
    let insertedCount = 0

    for (let i = 0; i < salesEvents.length; i += BATCH_SIZE) {
      const batch = salesEvents.slice(i, i + BATCH_SIZE)
      
      // Use upsert with ignoreDuplicates: true to skip existing records if we just want to fill gaps
      // OR standard upsert (update if exists) which is safer if data might change (unlikely for immutable txs).
      // Since transactions are immutable, onConflict: 'signature' with ignoreDuplicates: true is more efficient.
      const { error } = await supabaseAdmin
        .from('sales')
        .upsert(batch, { 
            onConflict: 'signature', 
            ignoreDuplicates: true 
        })

      if (error) {
        // Log carefully
        console.error('[Sync] Supabase Upsert Error:', error.message)
        throw new Error(`Supabase Error: ${error.message}`)
      }
      insertedCount += batch.length
    }

    return res.status(200).json({
      success: true,
      message: `Synced ${insertedCount} sales events`,
    })

  } catch (error) {
    // Log carefully
    console.error('[Sync] Fatal Error message:', error.message)
    // Now that we fixed the ByteString issue, we can try to return the error message again
    // so you can see it in the curl output.
    return res.status(500).json({ 
      error: `Internal Server Error: ${error.message}`
    })
  }
}
