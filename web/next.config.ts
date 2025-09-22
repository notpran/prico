import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  serverExternalPackages: ['ioredis'],
};

export default nextConfig;