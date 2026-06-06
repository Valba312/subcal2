/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  telemetry: false, // Disable telemetry for faster builds
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [{ source: "/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] }];
    }
    return [];
  },
  // Production optimization
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
};
module.exports = nextConfig;
