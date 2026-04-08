/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @cloudflare/next-on-pages
  experimental: {},
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
