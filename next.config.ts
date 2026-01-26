import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: isProduction
              ? "max-age=63072000; includeSubDomains; preload"
              : "max-age=0",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              productionDomain
                ? `https://${productionDomain}`
                : "",
              "https://lh3.googleusercontent.com",
              "https://*.googleapis.com",
              "https://*.github.com",
              "https://*.linkedin.com",
            ]
              .filter(Boolean)
              .join(" "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
