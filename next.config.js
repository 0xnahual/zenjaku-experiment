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
        ]
    },
}

module.exports = nextConfig
