import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  env: {
    ROOT_DIR: path.resolve(dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.cloudconvert.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
