/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: process.env.BASE_PATH || "",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
