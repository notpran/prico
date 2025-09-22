/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.clerk.dev', 'img.clerk.com'],
  },
}

module.exports = nextConfig