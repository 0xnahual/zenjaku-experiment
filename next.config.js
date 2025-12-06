/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    images: {
        domains: ['arweave.net'],
    },
}

module.exports = nextConfig
