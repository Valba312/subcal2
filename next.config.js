/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [{ source: "/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] }];
    }
    return [];
  },
};
module.exports = nextConfig;
