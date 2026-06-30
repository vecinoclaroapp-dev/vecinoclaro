import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Oculta el indicador flotante de Next.js en desarrollo
  devIndicators: false,
  // Permite el origen del preview panel
  allowedDevOrigins: ["*.z.ai", "*.space-z.ai"],
};

export default nextConfig;
