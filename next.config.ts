import type { NextConfig } from "next"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url))
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
const pages = process.env.GITHUB_PAGES === "1"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  outputFileTracingRoot: root,
  turbopack: { root },
  ...(pages ? { output: "export", basePath, trailingSlash: true } : {}),
}

export default nextConfig
