/** @type {import('next').NextConfig} */
const nextConfig = {
  // 绕过部署时的类型检查
  typescript: {
    ignoreBuildErrors: true, 
  },
  // 绕过部署时的 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;