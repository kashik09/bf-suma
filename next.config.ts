import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://uhhjnszgxfwmddvxdafj.supabase.co",
      "font-src 'self'",
      "connect-src 'self' https://uhhjnszgxfwmddvxdafj.supabase.co",
      "frame-ancestors 'none'"
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp }
        ]
      }
    ];
  }
};

export default nextConfig;
