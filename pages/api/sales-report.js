import { getSupabaseAdmin } from '../../lib/supabase'
import arweaveData from '../../data/arweave-uploads.json'
import zenjakuMapping from '../../data/zenjaku-mapping.json'
import { EXPERIMENT_START_DATE } from '../../config/constants'

// Create reverse mapping: mint address → zenjaku number
const addressToNumber = {}
Object.entries(zenjakuMapping).forEach(([num, data]) => {
  addressToNumber[data.address] = num
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { hours = 24, day } = req.query
  
  // Calculate current day number (days since experiment started)
  // Default: calculate from EXPERIMENT_START_DATE
  // Override: use ?day=X query parameter
  let currentDay
  if (day) {
    currentDay = parseInt(day, 10)
  } else {
    // Calculate days since start date (1-indexed: Day 1 = start date)
    const startDate = new Date(EXPERIMENT_START_DATE)
    const now = new Date()
    
    // Normalize both dates to UTC midnight for accurate day calculation
    const startUTC = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    ))
    const nowUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ))
    
    const daysSinceStart = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1
    currentDay = daysSinceStart
  }

  // Use @napi-rs/canvas which has better serverless support
  let createCanvas, loadImage, GlobalFonts
  try {
    const canvasModule = await import('@napi-rs/canvas')
    createCanvas = canvasModule.createCanvas
    loadImage = canvasModule.loadImage
    GlobalFonts = canvasModule.GlobalFonts
  } catch (canvasError) {
    console.error('[Sales Report] Canvas import failed:', canvasError.message)
    return res.status(500).json({ 
      error: 'Canvas library not available',
      details: canvasError.message
    })
  }

  // Register monospace font
  try {
    const fs = require('fs')
    const path = require('path')
    const os = require('os')
    
    // Download font from CDN at runtime
    const fontUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@latest/latin-400-normal.ttf'
    const tempDir = os.tmpdir()
    const fontPath = path.join(tempDir, 'IBMPlexMono.ttf')
    
    if (!fs.existsSync(fontPath)) {
      console.log('[Sales Report] Downloading font from CDN...')
      const fontResponse = await fetch(fontUrl)
      if (fontResponse.ok) {
        const fontBuffer = Buffer.from(await fontResponse.arrayBuffer())
        fs.writeFileSync(fontPath, fontBuffer)
        console.log('[Sales Report] Font downloaded')
      }
    }
    
    if (fs.existsSync(fontPath)) {
      GlobalFonts.registerFromPath(fontPath, 'Monospace')
      console.log('[Sales Report] Font registered')
    }
  } catch (fontError) {
    console.warn('[Sales Report] Font registration failed:', fontError.message)
  }

  try {
    const supabase = getSupabaseAdmin()
    const hoursAgo = new Date(Date.now() - Number(hours) * 60 * 60 * 1000).toISOString()

    // Fetch sales from last X hours with token_mint
    const { data: sales, error } = await supabase
      .from('sales')
      .select('buyer, seller, price, block_time, token_mint')
      .gte('block_time', hoursAgo)
      .order('block_time', { ascending: false })

    if (error) {
      console.error('Supabase Query Error:', error)
      throw error
    }

    // Calculate stats
    const totalSales = sales?.length || 0
    const totalVolume = sales?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0
    const avgPrice = totalSales > 0 ? totalVolume / totalSales : 0

    // Find highest sale that has an image available
    const highestSale = sales?.reduce((max, sale) => {
      const price = Number(sale.price) || 0
      const hasImage = sale.token_mint && arweaveData[`${sale.token_mint}.png`]
      if (!hasImage) return max
      return price > (max?.price || 0) ? { ...sale, price } : max
    }, null)

    // Get volume by wallet (like leaderboard - 50% credit to buyer, 50% to seller)
    const walletData = {}
    const royaltyShare = 0.00345 // 0.345% for donated/burned each

    sales?.forEach(sale => {
      const price = Number(sale.price) || 0
      const credit = price * 0.5
      const imageUrl = sale.token_mint ? arweaveData[`${sale.token_mint}.png`] : null

      // Credit buyer
      if (sale.buyer) {
        if (!walletData[sale.buyer]) {
          walletData[sale.buyer] = { volume: 0, items: [] }
        }
        walletData[sale.buyer].volume += credit
        if (imageUrl) {
          walletData[sale.buyer].items.push({ url: imageUrl, type: 'buy' })
        }
      }

      // Credit seller
      if (sale.seller) {
        if (!walletData[sale.seller]) {
          walletData[sale.seller] = { volume: 0, items: [] }
        }
        walletData[sale.seller].volume += credit
        if (imageUrl) {
          walletData[sale.seller].items.push({ url: imageUrl, type: 'sell' })
        }
      }
    })

    // Calculate donated/burned for each wallet
    Object.values(walletData).forEach(data => {
      data.donated = data.volume * royaltyShare
      data.burned = data.volume * royaltyShare
    })

    const topWallets = Object.entries(walletData)
      .sort((a, b) => b[1].volume - a[1].volume)
      .slice(0, 5)

    // HD Canvas - Twitter-friendly (wider aspect ratio)
    // Use smaller height if no sales to avoid white space
    const scale = 2
    const width = 2400
    const height = totalSales === 0 ? 1000 : 1600
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Scale everything
    ctx.scale(scale, scale)
    const w = width / scale
    const h = height / scale

    // Background (white)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    // Border
    ctx.strokeStyle = '#dddddd'
    ctx.lineWidth = 3
    ctx.strokeRect(30, 30, w - 60, h - 60)

    // Header - matching home page style
    ctx.fillStyle = '#222222'
    ctx.font = 'bold 48px Monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    // Text stroke for outline effect
    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 1
    
    const titleLines = ['THE ZENJAKU', 'EXPERIMENT']
    let titleY = 50
    const titleLineHeight = 48 // increased spacing between lines
    
    titleLines.forEach((line, idx) => {
      // Draw stroke first
      ctx.strokeText(line, 60, titleY)
      // Then fill
      ctx.fillText(line, 60, titleY)
      titleY += titleLineHeight
    })

    ctx.fillStyle = '#666666'
    ctx.font = '14px Monospace'
    ctx.fillText(`EXPERIMENT LOG · DAY ${currentDay}`, 60, 160)

    // Stats line
    ctx.font = 'bold 24px Monospace'
    
    // Transactions
    ctx.fillStyle = '#222222'
    const txText = `${totalSales}`
    ctx.fillText(txText, 60, 190)
    const txWidth = ctx.measureText(txText).width
    ctx.fillText('TRANSACTIONS', 60 + txWidth + 8, 190)
    
    // Volume - positioned after TRANSACTIONS with proper spacing
    ctx.fillStyle = '#ff9900'
    const volText = `${totalVolume.toFixed(2)}`
    const transactionsWidth = ctx.measureText('TRANSACTIONS').width
    const volX = 60 + txWidth + 8 + transactionsWidth + 30
    ctx.fillText(volText, volX, 190)
    const volWidth = ctx.measureText(volText).width
    ctx.fillText('SOL', volX + volWidth + 8, 190)
    
    // Avg Price - positioned after SOL with proper spacing
    ctx.fillStyle = '#222222'
    const avgText = `${avgPrice.toFixed(3)}`
    const solWidth = ctx.measureText('SOL').width
    const avgX = volX + volWidth + 8 + solWidth + 30
    ctx.fillText(avgText, avgX, 190)
    const avgWidth = ctx.measureText(avgText).width
    ctx.fillText('AVG', avgX + avgWidth + 8, 190)

    // Divider - below transactions with proper spacing
    ctx.strokeStyle = '#dddddd'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, 225)
    ctx.lineTo(w - 60, 225)
    ctx.stroke()

    // Highest Sale section (right side)
    if (highestSale && highestSale.price > 0) {
      const hsImageUrl = highestSale.token_mint ? arweaveData[`${highestSale.token_mint}.png`] : null
      const hsNumber = highestSale.token_mint ? addressToNumber[highestSale.token_mint] : null
      const hsSize = 100
      const hsX = w - 60 - hsSize
      const hsY = 50

      // Draw image first (or placeholder)
      if (hsImageUrl) {
        try {
          const hsImg = await loadImage(hsImageUrl)
          ctx.drawImage(hsImg, hsX, hsY, hsSize, hsSize)
          ctx.strokeStyle = '#ff9900'
          ctx.lineWidth = 2
          ctx.strokeRect(hsX, hsY, hsSize, hsSize)
        } catch (e) {
          ctx.fillStyle = '#eeeeee'
          ctx.fillRect(hsX, hsY, hsSize, hsSize)
          ctx.strokeStyle = '#ff9900'
          ctx.lineWidth = 2
          ctx.strokeRect(hsX, hsY, hsSize, hsSize)
        }
      } else {
        ctx.fillStyle = '#eeeeee'
        ctx.fillRect(hsX, hsY, hsSize, hsSize)
        ctx.strokeStyle = '#ff9900'
        ctx.lineWidth = 2
        ctx.strokeRect(hsX, hsY, hsSize, hsSize)
      }

      // Text to the left of the image
      ctx.fillStyle = '#888888'
      ctx.font = '10px Monospace'
      ctx.textAlign = 'right'
      ctx.fillText('TOP TRANSACTION', hsX - 10, hsY + 20)
      
      ctx.fillStyle = '#ff9900'
      ctx.font = 'bold 20px Monospace'
      ctx.fillText(`${highestSale.price.toFixed(3)} SOL`, hsX - 10, hsY + 45)
      
      if (hsNumber) {
        ctx.fillStyle = '#222222'
        ctx.font = 'bold 12px Monospace'
        ctx.fillText(`ZENJAKU #${hsNumber}`, hsX - 10, hsY + 65)
      }
      
      // Buyer address
      if (highestSale.buyer) {
        const shortBuyer = `${highestSale.buyer.slice(0, 4)}..${highestSale.buyer.slice(-4)}`
        ctx.fillStyle = '#888888'
        ctx.font = '9px Monospace'
        ctx.fillText(`BUYER: ${shortBuyer}`, hsX - 10, hsY + 80)
      }
      
      ctx.textAlign = 'left'
    }

    // Primary Actors section (no header text)
    let yPos = 240
    const imgSize = 36
    const maxImages = 12
    const entryHeight = 95

    for (let i = 0; i < topWallets.length; i++) {
      const [address, data] = topWallets[i]
      const shortAddr = `${address.slice(0, 4)}..${address.slice(-4)}`
      
      // Rank
      ctx.fillStyle = '#ff9900'
      ctx.font = 'bold 24px Monospace'
      ctx.fillText(`#${i + 1}`, 60, yPos + 20)
      
      // Address (prominent)
      ctx.fillStyle = '#222222'
      ctx.font = 'bold 18px Monospace'
      ctx.fillText(shortAddr, 110, yPos + 20)

      // Volume + SOL + DON + BRN in a row with consistent spacing
      ctx.fillStyle = '#ff9900'
      ctx.font = 'bold 18px Monospace'
      const entryVolText = data.volume.toFixed(3)
      ctx.fillText(entryVolText, 240, yPos + 20)
      const entryVolWidth = ctx.measureText(entryVolText).width
      
      ctx.fillStyle = '#888888'
      ctx.font = '10px Monospace'
      const solX = 240 + entryVolWidth + 6
      const smallTextY = yPos + 24  // Slightly lower to align with larger text baseline
      ctx.fillText('SOL', solX, smallTextY)
      const solWidth = ctx.measureText('SOL').width
      
      const donX = solX + solWidth + 20
      ctx.fillText(`DON: ${data.donated.toFixed(5)}`, donX, smallTextY)
      const donWidth = ctx.measureText(`DON: ${data.donated.toFixed(5)}`).width
      
      const brnX = donX + donWidth + 20
      ctx.fillText(`BRN: ${data.burned.toFixed(5)}`, brnX, smallTextY)
      
      // Full address (subtle, below)
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '9px Monospace'
      ctx.fillText(address, 110, yPos + 40)

      // Mini images with buy/sell indicators
      const items = data.items.filter(item => item.url).slice(0, maxImages)
      let imgX = 110

      if (items.length === 0) {
        ctx.fillStyle = '#cccccc'
        ctx.font = '10px Monospace'
        ctx.fillText('— no image data —', 110, yPos + 65)
      }

      for (const item of items) {
        try {
          const img = await loadImage(item.url)
          
          // Draw image (moved down for more spacing from address)
          ctx.drawImage(img, imgX, yPos + 58, imgSize, imgSize)
          
          // Very subtle color tint on bottom edge only
          ctx.globalAlpha = 0.4
          const gradient = ctx.createLinearGradient(imgX, yPos + 58, imgX, yPos + 58 + imgSize)
          gradient.addColorStop(0, 'transparent')
          gradient.addColorStop(0.7, 'transparent')
          gradient.addColorStop(1, item.type === 'buy' ? '#00cc00' : '#ff3333')
          ctx.fillStyle = gradient
          ctx.fillRect(imgX, yPos + 58, imgSize, imgSize)
          ctx.globalAlpha = 1.0
          
          // Subtle border
          ctx.strokeStyle = item.type === 'buy' ? '#00aa00' : '#cc0000'
          ctx.lineWidth = 1
          ctx.strokeRect(imgX, yPos + 58, imgSize, imgSize)
          
        } catch (e) {
          ctx.fillStyle = '#eeeeee'
          ctx.fillRect(imgX, yPos + 58, imgSize, imgSize)
        }
        imgX += imgSize + 5
      }

      // More indicator
      if (data.items.length > maxImages) {
        ctx.fillStyle = '#888888'
        ctx.font = '10px Monospace'
        ctx.fillText(`+${data.items.length - maxImages}`, imgX + 4, yPos + 80)
      }
      
      yPos += entryHeight
    }

    if (topWallets.length === 0) {
      // System-driven inactive state - structured monitoring console
      // PRIMARY ACTORS already drawn above, start with content
      
      yPos += 22
      
      // Primary metric - compact
      ctx.fillStyle = '#222222'
      ctx.font = 'bold 16px Monospace'
      const countText = '0'
      const countWidth = ctx.measureText(countText).width
      ctx.fillText(countText, 60, yPos)
      ctx.fillStyle = '#888888'
      ctx.font = '10px Monospace'
      ctx.fillText('ENTITIES', 60 + countWidth + 8, yPos)
      
      yPos += 28
      
      // System status section - structured grid
      ctx.fillStyle = '#666666'
      ctx.font = '11px Monospace'
      ctx.fillText('SYSTEM STATUS', 60, yPos)
      
      yPos += 20
      
      // Status grid - two columns with consistent spacing
      const statusLeft = 60
      const statusRight = 280
      const statusLineHeight = 15
      
      ctx.fillStyle = '#888888'
      ctx.font = '10px Monospace'
      
      // Column 1
      ctx.fillText('MONITORING', statusLeft, yPos)
      const monitoringWidth = ctx.measureText('MONITORING').width
      ctx.fillStyle = '#222222'
      ctx.fillText('ACTIVE', statusLeft + monitoringWidth + 8, yPos)
      
      // Column 2
      ctx.fillStyle = '#888888'
      ctx.fillText('SIGNAL', statusRight, yPos)
      const signalWidth = ctx.measureText('SIGNAL').width
      ctx.fillStyle = '#222222'
      ctx.fillText('STABLE', statusRight + signalWidth + 8, yPos)
      
      yPos += statusLineHeight
      
      ctx.fillStyle = '#888888'
      ctx.fillText(`WINDOW`, statusLeft, yPos)
      const windowWidth = ctx.measureText('WINDOW').width
      ctx.fillStyle = '#222222'
      ctx.fillText(`${hours}H`, statusLeft + windowWidth + 8, yPos)
      
      ctx.fillStyle = '#888888'
      ctx.fillText('EVENTS', statusRight, yPos)
      const eventsWidth = ctx.measureText('EVENTS').width
      ctx.fillStyle = '#222222'
      ctx.fillText('0', statusRight + eventsWidth + 8, yPos)
      
      yPos += statusLineHeight
      
      ctx.fillStyle = '#888888'
      ctx.fillText('ARCHIVE', statusLeft, yPos)
      const archiveWidth = ctx.measureText('ARCHIVE').width
      ctx.fillStyle = '#222222'
      ctx.fillText('READY', statusLeft + archiveWidth + 8, yPos)
      
      ctx.fillStyle = '#888888'
      ctx.fillText('QUEUE', statusRight, yPos)
      const queueWidth = ctx.measureText('QUEUE').width
      ctx.fillStyle = '#222222'
      ctx.fillText('CLEAR', statusRight + queueWidth + 8, yPos)
      
      yPos += statusLineHeight
      
      ctx.fillStyle = '#888888'
      ctx.fillText('CHAIN', statusLeft, yPos)
      const chainWidth = ctx.measureText('CHAIN').width
      ctx.fillStyle = '#222222'
      ctx.fillText('SOLANA', statusLeft + chainWidth + 8, yPos)
      
      ctx.fillStyle = '#888888'
      ctx.fillText('COLLECTION', statusRight, yPos)
      const collectionWidth = ctx.measureText('COLLECTION').width
      ctx.fillStyle = '#222222'
      ctx.fillText('ACTIVE', statusRight + collectionWidth + 8, yPos)
      
      yPos += 25
      
      // Continuity indicators - subtle footer
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '9px Monospace'
      ctx.fillText('MONITORING: CONTINUOUS', 60, yPos)
      ctx.fillText('LOG: RECORDED', statusRight, yPos)
    }

    // Calculate total donated/burned for the period
    const totalDonated = totalVolume * royaltyShare
    const totalBurned = totalVolume * royaltyShare

    // Summary - RIGHT SIDE (moved up for link visibility)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#888888'
    ctx.font = '12px Monospace'
    ctx.fillText('PERIOD TOTALS', w - 60, h - 140)
    
    ctx.fillStyle = '#ff9900'
    ctx.font = 'bold 16px Monospace'
    ctx.fillText(`DONATED: ${totalDonated.toFixed(5)} SOL`, w - 60, h - 115)
    ctx.fillText(`BURNED: ${totalBurned.toFixed(5)} SOL`, w - 60, h - 90)
    
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    // Footer - at actual bottom with proper padding to prevent cutoff
    ctx.fillStyle = '#aaaaaa'
    ctx.font = '10px Monospace'
    ctx.textBaseline = 'top'
    const timestamp = new Date().toISOString()
    ctx.fillText(`Generated: ${timestamp}`, 60, h - 50)
    
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#aaaaaa'
    ctx.font = '10px Monospace'
    ctx.fillText('zenjaku.fun/collect', w - 60, h - 50)
    ctx.textAlign = 'left'

    // Return as PNG
    const buffer = canvas.toBuffer('image/png')
    
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'no-cache')
    return res.send(buffer)

  } catch (error) {
    console.error('[Sales Report API] Error:', error)
    return res.status(500).json({ error: 'Failed to generate report', details: error.message })
  }
}


