/** @type {import('next').NextConfig} */
import path from "node:path";

const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jqguerhkcqptsemjkqtk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sportmonks.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sports.bzzoiro.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
