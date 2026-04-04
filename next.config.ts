import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7 // 7 days
  },

  // Faster builds
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"]
  }
};

export default nextConfig;
