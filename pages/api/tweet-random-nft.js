/**
 * API endpoint to tweet a random NFT collectible
 * 
 * Requires Twitter API credentials (same as tweet-sales-report):
 * - TWITTER_API_KEY
 * - TWITTER_API_SECRET
 * - TWITTER_ACCESS_TOKEN
 * - TWITTER_ACCESS_TOKEN_SECRET
 * 
 * Also requires:
 * - TWEET_SECRET_KEY (for endpoint authorization)
 * 
 * Usage: 
 * POST /api/tweet-random-nft
 * Headers: Authorization: Bearer YOUR_TWEET_SECRET_KEY
 */

let TwitterApi
try {
  TwitterApi = require('twitter-api-v2').TwitterApi
} catch (e) {
  TwitterApi = null
}

import zenjakuMapping from '../../data/zenjaku-mapping.json'
import arweaveData from '../../data/arweave-uploads.json'

export default async function handler(req, res) {
  // Allow GET for Vercel cron, POST for manual triggers
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Security check
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

  try {
    // Verify credentials
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

    // Step 1: Pick a random NFT
    const nftNumbers = Object.keys(zenjakuMapping)
    const randomIndex = Math.floor(Math.random() * nftNumbers.length)
    const nftNumber = nftNumbers[randomIndex]
    const nftData = zenjakuMapping[nftNumber]
    
    if (!nftData || !nftData.address) {
      throw new Error(`Invalid NFT data for number ${nftNumber}`)
    }

    const rarity = nftData.traits?.Rarity || 'Unknown'
    const imageKey = `${nftData.address}.png`
    const imageUrl = arweaveData[imageKey]

    if (!imageUrl) {
      throw new Error(`Image not found for NFT #${nftNumber}`)
    }

    console.log(`[Tweet Random NFT] Selected NFT #${nftNumber} (${rarity})`)

    // Step 2: Fetch the image
    console.log(`[Tweet Random NFT] Fetching image from: ${imageUrl}`)
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageData = Buffer.from(imageBuffer)

    // Step 3: Initialize Twitter client
    const twitterClient = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    })

    const rwClient = twitterClient.readWrite

    // Step 4: Upload media
    console.log('[Tweet Random NFT] Uploading media to Twitter...')
    const mediaId = await rwClient.v1.uploadMedia(imageData, {
      mimeType: 'image/png'
    })

    console.log(`[Tweet Random NFT] Media uploaded, ID: ${mediaId}`)

    // Step 5: Format tweet text
    const tweetText = `ENTITY: Zenjaku #${nftNumber}
RARITY: ${rarity}

https://zenjaku.fun/explorer/${nftNumber}`

    // Step 6: Post main tweet
    console.log('[Tweet Random NFT] Posting tweet...')
    const tweet = await rwClient.v2.tweet({
      text: tweetText,
      media: {
        media_ids: [mediaId]
      }
    })

    console.log(`[Tweet Random NFT] Tweet posted successfully: ${tweet.data.id}`)

    // Step 7: Post reply tweet
    console.log('[Tweet Random NFT] Posting reply tweet...')
    const replyTweet = await rwClient.v2.tweet({
      text: 'Join the experiment:\nzenjaku.fun/collect',
      reply: {
        in_reply_to_tweet_id: tweet.data.id
      }
    })

    console.log(`[Tweet Random NFT] Reply tweet posted: ${replyTweet.data.id}`)

    return res.status(200).json({
      success: true,
      tweetId: tweet.data.id,
      tweetUrl: `https://twitter.com/i/web/status/${tweet.data.id}`,
      replyTweetId: replyTweet.data.id,
      replyTweetUrl: `https://twitter.com/i/web/status/${replyTweet.data.id}`,
      nftNumber: nftNumber,
      rarity: rarity,
      message: 'Random NFT tweeted successfully with reply'
    })

  } catch (error) {
    console.error('[Tweet Random NFT] Error:', error)
    
    let errorDetails = error.message
    const errorCode = error.code || error.data?.status || (error.message?.match(/code (\d+)/)?.[1])
    
    if (errorCode == 32 || error.message?.includes('401') || error.message?.includes('authenticate')) {
      errorDetails = `Twitter authentication failed (401). Please check your Twitter API credentials.`
    } else if (errorCode == 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
      errorDetails = `Twitter permission denied (403). Make sure your app has "Read and Write" permissions.`
    }
    
    return res.status(500).json({ 
      error: 'Failed to tweet random NFT', 
      details: errorDetails,
      code: errorCode
    })
  }
}
