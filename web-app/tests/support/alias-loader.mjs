import path from "node:path";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";

const projectRoot = path.resolve(new URL("../../", import.meta.url).pathname);
const testDistRoot = path.join(projectRoot, ".test-dist");
const contentRoot = path.join(projectRoot, "app-content");

function resolveAliasedPath(specifier) {
  if (specifier === "next/server") {
    return pathToFileURL(path.join(projectRoot, "node_modules/next/server.js")).href;
  }

  if (specifier === "next/headers") {
    return pathToFileURL(path.join(projectRoot, "node_modules/next/headers.js")).href;
  }

  if (specifier.startsWith("@content/")) {
    return `contentjson:${specifier.slice("@content/".length)}`;
  }

  if (!specifier.startsWith("@/")) {
    return null;
  }

  const relativePath = `${specifier.slice(2)}.js`;
  return pathToFileURL(path.join(testDistRoot, relativePath)).href;
}

export function resolve(specifier, context, defaultResolve) {
  const aliasedPath = resolveAliasedPath(specifier);

  if (aliasedPath) {
    return {
      shortCircuit: true,
      url: aliasedPath
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.startsWith("contentjson:")) {
    const contentPath = path.join(contentRoot, url.slice("contentjson:".length));
    const source = await readFile(contentPath, "utf8");

    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${source};`
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
