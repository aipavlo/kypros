import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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

  if (specifier.endsWith(".json") && context.parentURL?.startsWith("file:")) {
    const parentPath = fileURLToPath(context.parentURL);
    const resolvedJsonPath = path.resolve(path.dirname(parentPath), specifier);

    return {
      shortCircuit: true,
      url: `jsonfile:${resolvedJsonPath}`
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

  if (url.startsWith("jsonfile:")) {
    const source = await readFile(url.slice("jsonfile:".length), "utf8");

    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${source};`
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
