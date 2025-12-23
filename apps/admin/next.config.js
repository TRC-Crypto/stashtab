/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@stashtab/config", "@stashtab/sdk"],
};

module.exports = nextConfig;

