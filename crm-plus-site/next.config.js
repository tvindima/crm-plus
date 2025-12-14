/** @type {import('next').NextConfig} */
const root = __dirname;

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: root,
  turbopack: {
    root,
  },
};

module.exports = nextConfig;
