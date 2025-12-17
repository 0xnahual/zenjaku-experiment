/**
 * API endpoint to tweet the sales report image
 * 
 * Requires Twitter API credentials (from Twitter Developer Portal):
 * - TWITTER_API_KEY
 * - TWITTER_API_SECRET
 * - TWITTER_ACCESS_TOKEN
 * - TWITTER_ACCESS_TOKEN_SECRET
 * 
 * Also requires:
 * - TWEET_SECRET_KEY (for endpoint authorization)
 * - NEXT_PUBLIC_BASE_URL (your domain, e.g., https://zenjaku.fun)
 * 
 * Usage: 
 * POST /api/tweet-sales-report?day=1&hours=24
 * Headers: Authorization: Bearer YOUR_TWEET_SECRET_KEY
 * 
 * Install dependency: npm install twitter-api-v2
 */

let TwitterApi
try {
  TwitterApi = require('twitter-api-v2').TwitterApi
} catch (e) {
  // Library not installed
  TwitterApi = null
}

export default async function handler(req, res) {
  // Allow GET for Vercel cron, POST for manual triggers
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Security check - accept either TWEET_SECRET_KEY or CRON_SECRET
  const authHeader = req.headers.authorization
  const expectedTweetAuth = `Bearer ${process.env.TWEET_SECRET_KEY}`
  const expectedCronAuth = `Bearer ${process.env.CRON_SECRET}`
  
  const isValidAuth = authHeader === expectedTweetAuth || authHeader === expectedCronAuth
  if (!isValidAuth) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!TwitterApi) {
    return res.status(500).json({ 
      error: 'Twitter API library not installed',
      details: 'Please run: npm install twitter-api-v2'
    })
  }

  const { day = 1, hours = 24 } = req.query

  try {
    // Verify credentials are present and strip quotes if present
    const stripQuotes = (str) => str?.trim().replace(/^["']|["']$/g, '') || ''
    const apiKey = stripQuotes(process.env.TWITTER_API_KEY)
    const apiSecret = stripQuotes(process.env.TWITTER_API_SECRET)
    const accessToken = stripQuotes(process.env.TWITTER_ACCESS_TOKEN)
    const accessSecret = stripQuotes(process.env.TWITTER_ACCESS_TOKEN_SECRET)

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      const missing = []
      if (!apiKey) missing.push('TWITTER_API_KEY')
      if (!apiSecret) missing.push('TWITTER_API_SECRET')
      if (!accessToken) missing.push('TWITTER_ACCESS_TOKEN')
      if (!accessSecret) missing.push('TWITTER_ACCESS_TOKEN_SECRET')
      throw new Error(`Missing Twitter credentials: ${missing.join(', ')}`)
    }

    // Debug: Check if credentials look valid (without logging actual values)
    console.log('[Tweet] Credentials check:', {
      apiKeyLength: apiKey.length,
      apiSecretLength: apiSecret.length,
      accessTokenLength: accessToken.length,
      accessSecretLength: accessSecret.length,
      accessTokenStartsWith: accessToken.substring(0, 10),
      accessSecretStartsWith: accessSecret.substring(0, 10),
    })

    // Step 1: Fetch the sales report image from our own API
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl && process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    }
    if (!baseUrl) {
      baseUrl = 'http://localhost:1217'
    }
    const reportUrl = `${baseUrl}/api/sales-report?day=${day}&hours=${hours}`
    
    console.log(`[Tweet] Fetching report from: ${reportUrl}`)
    console.log(`[Tweet] NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL}`)
    console.log(`[Tweet] VERCEL_URL: ${process.env.VERCEL_URL}`)
    
    let imageResponse
    try {
      imageResponse = await fetch(reportUrl)
    } catch (fetchError) {
      console.error('[Tweet] Fetch error:', fetchError)
      throw new Error(`Failed to fetch sales report from ${reportUrl}: ${fetchError.message}. Make sure NEXT_PUBLIC_BASE_URL is set in your Vercel environment variables (e.g., https://zenjaku.fun)`)
    }
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text().catch(() => 'Unable to read error')
      throw new Error(`Sales report returned ${imageResponse.status}: ${errorText}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageData = Buffer.from(imageBuffer)

    // Step 2: Initialize Twitter client
    console.log('[Tweet] Initializing Twitter client...')
    
    // Test authentication first
    try {
      const twitterClient = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      })

      const rwClient = twitterClient.readWrite
      
      // Test authentication by getting user info
      console.log('[Tweet] Testing authentication...')
      const me = await rwClient.v2.me()
      console.log('[Tweet] Authenticated as:', me.data.username)
      
      // Continue with media upload
      return await uploadAndTweet(rwClient, imageData, day, hours, baseUrl, res)
    } catch (authError) {
      console.error('[Tweet] Auth test failed:', authError)
      throw new Error(`Authentication failed: ${authError.message}. Make sure you regenerated Access Token and Secret after enabling Read and Write permissions.`)
    }
  } catch (error) {
    console.error('[Tweet Sales Report] Error:', error)
    
    // Provide more helpful error messages
    let errorDetails = error.message
    const errorCode = error.code || error.data?.status || (error.message?.match(/code (\d+)/)?.[1])
    
    if (errorCode == 32 || error.message?.includes('401') || error.message?.includes('authenticate')) {
      errorDetails = `Twitter authentication failed (401). Please check:
1. All 4 credentials are correct in .env (no extra quotes or spaces)
2. Access Token and Access Token Secret are different values
3. Your Twitter app has "Read and Write" permissions enabled
4. You've regenerated BOTH Access Token and Access Token Secret after enabling write permissions
5. Restarted your dev server after updating .env
Original error: ${error.message}`
    } else if (errorCode == 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
      errorDetails = `Twitter permission denied (403). This usually means:
1. Your app only has "Read" permissions - you need "Read and Write"
2. Go to: https://developer.x.com/en/portal/dashboard -> Your App -> Settings
3. Under "App permissions", change to "Read and Write"
4. IMPORTANT: After changing permissions, you MUST regenerate your Access Token and Access Token Secret
5. Go back to "Keys and tokens" and regenerate both tokens
6. Update your .env file with the new tokens
7. Restart your dev server
Original error: ${error.message}`
    }
    
    return res.status(500).json({ 
      error: 'Failed to tweet sales report', 
      details: errorDetails,
      code: errorCode
    })
  }
}

async function uploadAndTweet(rwClient, imageData, day, hours, baseUrl, res) {
  // Step 3: Upload media
  console.log('[Tweet] Uploading media to Twitter...')
  const mediaId = await rwClient.v1.uploadMedia(imageData, {
    mimeType: 'image/png'
  })

  console.log(`[Tweet] Media uploaded, ID: ${mediaId}`)

  // Step 4: Post tweet with media (no caption)
  console.log('[Tweet] Posting tweet...')
  const tweet = await rwClient.v2.tweet({
    media: {
      media_ids: [mediaId]
    }
  })

  console.log(`[Tweet] Tweet posted successfully: ${tweet.data.id}`)

  return res.status(200).json({
    success: true,
    tweetId: tweet.data.id,
    tweetUrl: `https://twitter.com/i/web/status/${tweet.data.id}`,
    mediaId: mediaId,
    message: 'Sales report tweeted successfully'
  })
}

