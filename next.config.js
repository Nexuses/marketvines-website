const { withPayload } = require("@payloadcms/next/withPayload");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Avoid picking up a parent lockfile (e.g. C:\Users\Ayan\package-lock.json)
  // which breaks static asset serving from this project's /public folder.
  turbopack: {
    root: __dirname,
  },
};

module.exports = withPayload(nextConfig);
