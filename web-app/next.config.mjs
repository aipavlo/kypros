import path from "node:path";

const appContentPath = path.resolve("./app-content");
const isGitHubPagesBuild = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "github-pages";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: isGitHubPagesBuild && basePath ? basePath : undefined,
  basePath: isGitHubPagesBuild && basePath ? basePath : undefined,
  images: {
    unoptimized: isGitHubPagesBuild
  },
  output: isGitHubPagesBuild ? "export" : undefined,
  trailingSlash: isGitHubPagesBuild,
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
