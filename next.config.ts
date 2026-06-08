import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // three.js + drei ship modern ESM that benefits from being transpiled by Next.
  transpilePackages: ["three"],

  // This worktree's `node_modules` is a symlink into a sibling checkout
  // (../../Midgard Design NEW/midgard-gateway/node_modules). By default
  // Turbopack infers the project root at the worktree and refuses to resolve a
  // symlink that points "out of the filesystem root", which aborts `next build`.
  // Pointing the Turbopack root at the shared parent directory lets it follow
  // the symlink. Webpack tolerates the symlink regardless.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
