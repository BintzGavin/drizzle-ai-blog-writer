/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "oaidalleapiprodscus.blob.core.windows.net",
      "replicate.com",
      "replicate.delivery",
    ],
  },
};

module.exports = nextConfig;
