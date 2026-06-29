import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Oculta el indicador flotante de Next.js (la "N" abajo a la izquierda) en desarrollo
  devIndicators: false,
};

export default nextConfig;
