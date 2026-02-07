/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@agentropolis/shared'],
  api: {
    bodyParser: {
      sizeLimit: '100kb',
    },
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    config.externals.push(
      'pino-pretty', 
      'lokijs', 
      'encoding',
      '@coinbase/wallet-sdk',
      '@gemini-wallet/core',
      '@react-native-async-storage/async-storage',
    )
    return config
  },
}

module.exports = nextConfig
