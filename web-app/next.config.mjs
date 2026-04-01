import path from "node:path";

const appContentPath = path.resolve("./app-content");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      "@content": appContentPath
    }
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@content": appContentPath
    };

    return config;
  },
  typedRoutes: false
};

export default nextConfig;
