import type { NextConfig } from "next"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  outputFileTracingRoot: root,
  turbopack: { root },
}

export default nextConfig
