import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Pin Turbopack to this app when another lockfile exists above (e.g. on Desktop). */
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  outputFileTracingRoot: rootDir,
};

export default nextConfig;
