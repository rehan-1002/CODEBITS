import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ["lucide-react"],
  allowedDevOrigins: [
    "10.220.204.16",
    "10.220.204.16:3000",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
};

export default nextConfig;
