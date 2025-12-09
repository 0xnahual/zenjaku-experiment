import { getSupabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    // 1. Security Check
    const authHeader = req.headers.authorization
    const expectedAuth = `Bearer ${process.env.SYNC_SECRET_KEY}`

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (authHeader !== expectedAuth) {
        console.warn('Unauthorized reset attempt')
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        const supabaseAdmin = getSupabaseAdmin()

        // 2. Delete All Records from 'sales' table
        // Intentionally no filter (.neq('id', 0) is a trick to delete all rows if no other where clause is provided, 
        // depending on Supabase version, but typically .delete().gte('id', 0) or similar is needed if 'delete all' isn't allowed without a where clause)
        // Actually, .delete().neq('signature', '0') is safer to ensure it hits all rows since signature is likely the PK.
        const { count, error } = await supabaseAdmin
            .from('sales')
            .delete({ count: 'exact' })
            .neq('signature', 'PLACEHOLDER_TO_MATCH_ALL') // We need a condition that acts like TRUE.
            .or('signature.neq.PLACEHOLDER') // Actually, simpler: just use a condition that is always true or spans the whole range.

        // A cleaner way in Supabase/PostgREST to delete all rows is often: .delete().neq('some_column', 'impossible_value') <- this deletes nothing.
        // To delete ALL, you usually omit the filter, but the client SDK might block accidental deletes.
        // Let's use .neq('signature', 'impossible_value') which effectively matches everything if the value matches nothing? NO.
        // Correct way: .delete().gte('created_at', '1970-01-01') cover everything?

        // Let's try .neq('signature', '0') assuming signatures are never '0'.

        // Re-evaluating: To delete all rows, we can just filter by something that is true for all rows.
        // Since 'signature' is the PK string, let's say .ilike('signature', '%')?

        const { count: deletedCount, error: deleteError } = await supabaseAdmin
            .from('sales')
            .delete({ count: 'exact' })
            .ilike('signature', '%') // Matches any signature

        if (deleteError) {
            throw deleteError
        }

        return res.status(200).json({
            success: true,
            message: `Database cleared. Deleted ${deletedCount} records from 'sales'.`,
            count: deletedCount
        })

    } catch (error) {
        console.error('[Reset DB] Error:', error.message)
        return res.status(500).json({
            error: `Internal Server Error: ${error.message}`
        })
    }
}
