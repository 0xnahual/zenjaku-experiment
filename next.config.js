/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    skipTrailingSlashRedirect: true,
    images: {
        domains: ['arweave.net'],
    },
    async redirects() {
        return [
            {
                source: '/collect',
                destination: 'https://magiceden.io/marketplace/vibe_knights',
                permanent: false,
            },
            {
                source: '/collect/:address',
                destination: 'https://magiceden.io/item-details/:address',
                permanent: false,
            },
        ]
    },
}

module.exports = nextConfig
