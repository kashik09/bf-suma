import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uhhjnszgxfwmddvxdafj.supabase.co"
      }
    ]
  },

  // Faster builds
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"]
  }

  // Security headers are set in src/middleware.ts (single source of truth)
};

export default nextConfig;
