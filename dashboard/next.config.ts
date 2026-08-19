import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/*": ["./data/kurupam.db"],
  },
  devIndicators: false,
};

export default nextConfig;
