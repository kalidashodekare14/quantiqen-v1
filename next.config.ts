import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const platformUrl =
  process.env.NEXT_PUBLIC_PLATFORM_API_URL || "https://quantiqen-backend.onrender.com";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
      {
        source: "/platform/:path*",
        destination: `${platformUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
