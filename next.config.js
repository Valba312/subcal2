/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] }
  },
  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru'
  }
}
module.exports = nextConfig
