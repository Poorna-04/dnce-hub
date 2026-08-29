/// <reference types="node" />
import type { NextConfig } from "next";

/**
 * Browser calls `/api/v1/*` (NEXT_PUBLIC_API_BASE_URL). Next proxies them
 * to Spring using SPRING_BASE_URL, which must be reachable from this process:
 *
 *   Local `next dev`:  http://localhost:8080/api/v1
 *   Docker Compose:    http://backend:8080/api/v1
 */
const springBase = (
  process.env.SPRING_BASE_URL ?? "http://localhost:8080/api/v1"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${springBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
