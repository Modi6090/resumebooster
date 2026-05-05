/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
  // Mark the export route as Node.js runtime (not Edge)
  experimental: {
    serverComponentsExternalPackages: ["puppeteer", "@sparticuz/chromium"],
  },
};

module.exports = nextConfig;