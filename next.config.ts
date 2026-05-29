import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // three.js + drei ship modern ESM that benefits from being transpiled by Next.
  transpilePackages: ["three"],
};

export default nextConfig;
