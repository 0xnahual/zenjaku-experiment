const fs = require('fs')
const path = require('path')

const metadataDir = path.join(__dirname, '../data/blockchain_metadata')
const outputPath = path.join(__dirname, '../data/zenjaku-mapping.json')

const files = fs.readdirSync(metadataDir).filter(f => f.endsWith('.json'))

const mapping = {}

for (const file of files) {
    const filePath = path.join(metadataDir, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    const mintAddress = data.mintAddress
    const name = data.onChainMetadata?.name || data.jsonMetadata?.name
    const attributes = data.jsonMetadata?.attributes || []
    
    // Convert attributes array to object
    const traits = {}
    for (const attr of attributes) {
        if (attr.trait_type && attr.value && attr.value !== 'None') {
            traits[attr.trait_type] = attr.value
        }
    }
    
    if (name) {
        const match = name.match(/#(\d+)/)
        if (match) {
            const number = parseInt(match[1])
            mapping[number] = {
                address: mintAddress,
                traits: traits
            }
        }
    }
}

// Sort by number and write
const sorted = {}
Object.keys(mapping)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(num => {
        sorted[num] = mapping[num]
    })

fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2))
console.log(`Generated mapping with ${Object.keys(sorted).length} entries`)
console.log(`Saved to ${outputPath}`)
