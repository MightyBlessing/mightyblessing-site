import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Admin uploads pass through Next's proxy before reaching route handlers.
    // Raise the buffered request limit so larger gallery images can be parsed.
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
