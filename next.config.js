/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    skipTrailingSlashRedirect: true,
    images: {
        domains: ['arweave.net'],
    },
}

module.exports = nextConfig
