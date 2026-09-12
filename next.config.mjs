/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Поддержка экспорта статики и развертывания на Vercel
  swcMinify: true,
};

export default nextConfig;
