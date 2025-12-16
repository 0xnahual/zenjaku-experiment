import { getSupabaseAdmin } from '../../lib/supabase'
import { createCanvas, loadImage } from 'canvas'
import arweaveData from '../../data/arweave-uploads.json'
import zenjakuMapping from '../../data/zenjaku-mapping.json'

// Create reverse mapping: mint address → zenjaku number
const addressToNumber = {}
Object.entries(zenjakuMapping).forEach(([num, data]) => {
  addressToNumber[data.address] = num
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { hours = 24, day = 1 } = req.query

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
    const scale = 2
    const width = 2400
    const height = 1600
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

    // Header - MUCH BIGGER
    ctx.fillStyle = '#ff9900'
    ctx.font = 'bold 48px monospace'
    ctx.fillText('THE ZENJAKU EXPERIMENT', 60, 100)

    ctx.fillStyle = '#666666'
    ctx.font = '20px monospace'
    ctx.fillText(`EXPERIMENT LOG · DAY ${day}`, 60, 135)

    // Stats line - MUCH BIGGER
    ctx.font = 'bold 36px monospace'
    
    // Transactions
    ctx.fillStyle = '#222222'
    const txText = `${totalSales}`
    ctx.fillText(txText, 60, 185)
    const txWidth = ctx.measureText(txText).width
    ctx.fillStyle = '#888888'
    ctx.font = '18px monospace'
    ctx.fillText('TRANSACTIONS', 60 + txWidth + 12, 185)
    
    // Volume
    ctx.font = 'bold 36px monospace'
    ctx.fillStyle = '#ff9900'
    const volText = `${totalVolume.toFixed(2)}`
    ctx.fillText(volText, 320, 185)
    const volWidth = ctx.measureText(volText).width
    ctx.fillStyle = '#888888'
    ctx.font = '18px monospace'
    ctx.fillText('SOL', 320 + volWidth + 8, 185)
    
    // Avg Price
    ctx.font = 'bold 36px monospace'
    ctx.fillStyle = '#222222'
    const avgText = `${avgPrice.toFixed(3)}`
    ctx.fillText(avgText, 520, 185)
    const avgWidth = ctx.measureText(avgText).width
    ctx.fillStyle = '#888888'
    ctx.font = '18px monospace'
    ctx.fillText('AVG', 520 + avgWidth + 8, 185)

    // Highest Sale section (right side) - BIGGER
    if (highestSale && highestSale.price > 0) {
      const hsImageUrl = highestSale.token_mint ? arweaveData[`${highestSale.token_mint}.png`] : null
      const hsNumber = highestSale.token_mint ? addressToNumber[highestSale.token_mint] : null
      const hsSize = 130
      const hsX = w - 60 - hsSize
      const hsY = 60

      // Draw image first (or placeholder)
      if (hsImageUrl) {
        try {
          const hsImg = await loadImage(hsImageUrl)
          ctx.drawImage(hsImg, hsX, hsY, hsSize, hsSize)
          ctx.strokeStyle = '#ff9900'
          ctx.lineWidth = 3
          ctx.strokeRect(hsX, hsY, hsSize, hsSize)
        } catch (e) {
          ctx.fillStyle = '#eeeeee'
          ctx.fillRect(hsX, hsY, hsSize, hsSize)
          ctx.strokeStyle = '#ff9900'
          ctx.lineWidth = 3
          ctx.strokeRect(hsX, hsY, hsSize, hsSize)
        }
      } else {
        ctx.fillStyle = '#eeeeee'
        ctx.fillRect(hsX, hsY, hsSize, hsSize)
        ctx.strokeStyle = '#ff9900'
        ctx.lineWidth = 3
        ctx.strokeRect(hsX, hsY, hsSize, hsSize)
      }

      // Text to the left of the image
      ctx.fillStyle = '#888888'
      ctx.font = '14px monospace'
      ctx.textAlign = 'right'
      ctx.fillText('TOP TRANSACTION', hsX - 15, hsY + 25)
      
      ctx.fillStyle = '#ff9900'
      ctx.font = 'bold 28px monospace'
      ctx.fillText(`${highestSale.price.toFixed(3)} SOL`, hsX - 15, hsY + 60)
      
      if (hsNumber) {
        ctx.fillStyle = '#222222'
        ctx.font = 'bold 16px monospace'
        ctx.fillText(`ZENJAKU #${hsNumber}`, hsX - 15, hsY + 85)
      }
      
      // Buyer address
      if (highestSale.buyer) {
        const shortBuyer = `${highestSale.buyer.slice(0, 4)}..${highestSale.buyer.slice(-4)}`
        ctx.fillStyle = '#888888'
        ctx.font = '12px monospace'
        ctx.fillText(`BUYER: ${shortBuyer}`, hsX - 15, hsY + 105)
      }
      
      ctx.textAlign = 'left'
    }

    // Divider
    ctx.strokeStyle = '#dddddd'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(60, 210)
    ctx.lineTo(w - 60, 210)
    ctx.stroke()

    // Primary Actors section - BIGGER
    ctx.fillStyle = '#666666'
    ctx.font = '16px monospace'
    ctx.fillText('PRIMARY ACTORS', 60, 245)

    let yPos = 275
    const imgSize = 48
    const maxImages = 12
    const entryHeight = 95

    for (let i = 0; i < topWallets.length; i++) {
      const [address, data] = topWallets[i]
      const shortAddr = `${address.slice(0, 4)}..${address.slice(-4)}`
      
      // Rank - BIGGER
      ctx.fillStyle = '#ff9900'
      ctx.font = 'bold 32px monospace'
      ctx.fillText(`#${i + 1}`, 60, yPos + 25)
      
      // Address (prominent) - BIGGER
      ctx.fillStyle = '#222222'
      ctx.font = 'bold 22px monospace'
      ctx.fillText(shortAddr, 120, yPos + 25)

      // Volume - BIGGER
      ctx.fillStyle = '#ff9900'
      ctx.font = 'bold 22px monospace'
      const entryVolText = data.volume.toFixed(3)
      ctx.fillText(entryVolText, 280, yPos + 25)
      const entryVolWidth = ctx.measureText(entryVolText).width
      ctx.fillStyle = '#888888'
      ctx.font = '14px monospace'
      ctx.fillText('SOL', 280 + entryVolWidth + 6, yPos + 25)

      // Donated & Burned - BIGGER
      ctx.fillText(`DON: ${data.donated.toFixed(5)}`, 280 + entryVolWidth + 60, yPos + 25)
      ctx.fillText(`BRN: ${data.burned.toFixed(5)}`, 280 + entryVolWidth + 200, yPos + 25)
      
      // Full address (subtle, below)
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '12px monospace'
      ctx.fillText(address, 120, yPos + 45)

      // Mini images with buy/sell indicators
      const items = data.items.filter(item => item.url).slice(0, maxImages)
      let imgX = 120

      if (items.length === 0) {
        ctx.fillStyle = '#cccccc'
        ctx.font = '14px monospace'
        ctx.fillText('— no image data —', 120, yPos + 70)
      }

      for (const item of items) {
        try {
          const img = await loadImage(item.url)
          
          // Draw image
          ctx.drawImage(img, imgX, yPos + 55, imgSize, imgSize)
          
          // Very subtle color tint on bottom edge only
          ctx.globalAlpha = 0.4
          const gradient = ctx.createLinearGradient(imgX, yPos + 55, imgX, yPos + 55 + imgSize)
          gradient.addColorStop(0, 'transparent')
          gradient.addColorStop(0.7, 'transparent')
          gradient.addColorStop(1, item.type === 'buy' ? '#00cc00' : '#ff3333')
          ctx.fillStyle = gradient
          ctx.fillRect(imgX, yPos + 55, imgSize, imgSize)
          ctx.globalAlpha = 1.0
          
          // Subtle border
          ctx.strokeStyle = item.type === 'buy' ? '#00aa00' : '#cc0000'
          ctx.lineWidth = 2
          ctx.strokeRect(imgX, yPos + 55, imgSize, imgSize)
          
        } catch (e) {
          ctx.fillStyle = '#eeeeee'
          ctx.fillRect(imgX, yPos + 58, imgSize, imgSize)
        }
        imgX += imgSize + 5
      }

      // More indicator
      if (data.items.length > maxImages) {
        ctx.fillStyle = '#888888'
        ctx.font = '14px monospace'
        ctx.fillText(`+${data.items.length - maxImages}`, imgX + 6, yPos + 80)
      }
      
      yPos += entryHeight
    }

    if (topWallets.length === 0) {
      ctx.fillStyle = '#888888'
      ctx.font = '20px monospace'
      ctx.fillText('No sales in this period', 60, yPos)
    }

    // Calculate total donated/burned for the period
    const totalDonated = totalVolume * royaltyShare
    const totalBurned = totalVolume * royaltyShare

    // Summary - RIGHT SIDE (higher up)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#888888'
    ctx.font = '14px monospace'
    ctx.fillText('PERIOD TOTALS', w - 60, h - 130)
    
    ctx.fillStyle = '#ff9900'
    ctx.font = 'bold 20px monospace'
    ctx.fillText(`DONATED: ${totalDonated.toFixed(5)} SOL`, w - 60, h - 100)
    ctx.fillText(`BURNED: ${totalBurned.toFixed(5)} SOL`, w - 60, h - 70)
    
    ctx.textAlign = 'left'

    // Footer - at actual bottom with clear separation
    ctx.fillStyle = '#aaaaaa'
    ctx.font = '14px monospace'
    const timestamp = new Date().toISOString()
    ctx.fillText(`${timestamp}`, 60, h - 40)
    
    ctx.textAlign = 'right'
    ctx.fillStyle = '#aaaaaa'
    ctx.font = '14px monospace'
    ctx.fillText('zenjaku.fun/collect', w - 60, h - 40)
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

