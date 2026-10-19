import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Playwright uses 127.0.0.1 while Next dev normally starts on localhost.
  // Limit this extra origin to development requests only.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
