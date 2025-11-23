import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/career-roadmap',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/career-roadmap/result',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
