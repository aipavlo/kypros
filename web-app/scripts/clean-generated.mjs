import { rm } from "node:fs/promises";

const generatedPaths = [
  new URL("../.next", import.meta.url),
  new URL("../.test-dist", import.meta.url),
  new URL("../out", import.meta.url),
  new URL("../build", import.meta.url),
  new URL("../dist", import.meta.url),
  new URL("../coverage", import.meta.url),
  new URL("../storybook-static", import.meta.url),
  new URL("../.turbo", import.meta.url),
  new URL("../tsconfig.tsbuildinfo", import.meta.url)
];

await Promise.all(
  generatedPaths.map((targetPath) =>
    rm(targetPath, {
      recursive: true,
      force: true
    })
  )
);
