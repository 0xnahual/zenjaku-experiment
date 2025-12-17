/**
 * Script to refresh Magic Eden metadata for all NFTs
 * 
 * Usage: node scripts/refresh-magiceden-metadata.js
 */

const fs = require('fs')
const path = require('path')

// Magic Eden refresh endpoint (found via network inspection)
const REFRESH_ENDPOINT_BASE = 'https://api-mainnet.magiceden.io/rpc/refreshNFTsByMintAddresses'
const REFRESH_METHOD = 'POST'

// Load all mint addresses from zenjaku-mapping.json
const mappingPath = path.join(__dirname, '../data/zenjaku-mapping.json')
const zenjakuMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))

// Extract all mint addresses
const mintAddresses = Object.values(zenjakuMapping).map(item => item.address)

console.log(`Found ${mintAddresses.length} NFTs to refresh`)

// Rate limiting - don't hammer their API
const DELAY_MS = 1000 // 1 second between requests
const BATCH_SIZE = 10 // Process in batches

async function refreshMetadata(mintAddress) {
  try {
    // Endpoint format: /rpc/refreshNFTsByMintAddresses/{mintAddress}
    // Note: Uses built-in fetch (Node 18+) or install node-fetch for older versions
    const response = await fetch(`${REFRESH_ENDPOINT_BASE}/${mintAddress}`, {
      method: REFRESH_METHOD,
      headers: {
        'Content-Type': 'application/json',
      },
      // Body is null based on network inspection
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    // Some endpoints might return empty response
    let data = null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (e) {
        // Empty JSON response is OK
        data = { success: true }
      }
    }

    return { success: true, mintAddress, data }
  } catch (error) {
    return { success: false, mintAddress, error: error.message }
  }
}

async function refreshAll() {
  const results = {
    success: [],
    failed: [],
  }

  console.log(`Starting refresh for ${mintAddresses.length} NFTs...`)
  console.log(`Using delay: ${DELAY_MS}ms between requests`)

  for (let i = 0; i < mintAddresses.length; i++) {
    const mintAddress = mintAddresses[i]
    const progress = `[${i + 1}/${mintAddresses.length}]`

    console.log(`${progress} Refreshing ${mintAddress}...`)

    const result = await refreshMetadata(mintAddress)

    if (result.success) {
      results.success.push(result)
      console.log(`${progress} ✓ Success`)
    } else {
      results.failed.push(result)
      console.log(`${progress} ✗ Failed: ${result.error}`)
    }

    // Rate limiting
    if (i < mintAddresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }

  console.log('\n=== RESULTS ===')
  console.log(`Success: ${results.success.length}`)
  console.log(`Failed: ${results.failed.length}`)

  if (results.failed.length > 0) {
    console.log('\nFailed addresses:')
    results.failed.forEach(r => console.log(`  - ${r.mintAddress}: ${r.error}`))
  }

  // Save results to file
  const resultsPath = path.join(__dirname, '../data/refresh-results.json')
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2))
  console.log(`\nResults saved to: ${resultsPath}`)
}

// Run if called directly
if (require.main === module) {
  refreshAll().catch(console.error)
}

module.exports = { refreshMetadata, refreshAll }

