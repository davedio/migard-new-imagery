import type { NextConfig } from "next";
import { realpathSync } from "node:fs";
import path from "node:path";

/**
 * Turbopack root.
 *
 * In this worktree `node_modules` is a SYMLINK to the primary repo's
 * `node_modules`, which lives in a sibling directory tree. Turbopack derives a
 * "filesystem root" (the common ancestor of the project + its inputs) and
 * refuses to resolve a symlink whose target escapes that root, panicking with
 * "Symlink [project]/node_modules is invalid, it points out of the filesystem
 * root". The fix is to widen the root to the deepest directory that contains
 * BOTH this worktree and the real `node_modules` target.
 *
 * We compute that common ancestor at build time so the config stays correct
 * regardless of where the worktree / primary repo sit on disk.
 */
function turbopackRoot(): string {
  const here = __dirname;
  let modulesReal: string;
  try {
    modulesReal = realpathSync(path.join(here, "node_modules"));
  } catch {
    return here;
  }
  const a = here.split(path.sep);
  const b = modulesReal.split(path.sep);
  const common: string[] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) break;
    common.push(a[i]);
  }
  const root = common.join(path.sep);
  return root || here;
}

const nextConfig: NextConfig = {
  // three.js + drei ship modern ESM that benefits from being transpiled by Next.
  transpilePackages: ["three"],
  turbopack: {
    root: turbopackRoot(),
  },
};

export default nextConfig;
