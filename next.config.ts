import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...({
    eslint: {
      // Disable ESLint during build, lint is run separately
      ignoreDuringBuilds: true,
    },
  } as any),
};

export default nextConfig;
