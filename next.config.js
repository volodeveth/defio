/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["viem", "wagmi", "framer-motion", "lucide-react"]
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com']
  }
};

module.exports = nextConfig;