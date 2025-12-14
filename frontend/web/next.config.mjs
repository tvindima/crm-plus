/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Desativa otimização para resolver problemas de carregamento
  },
};

export default nextConfig;
