/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@stashtab/sdk', '@stashtab/config'],
};

module.exports = nextConfig;

