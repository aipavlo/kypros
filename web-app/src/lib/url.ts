export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aipavlo.github.io/kypros/";

const parsedSiteUrl = new URL(SITE_URL);
const normalizedSiteRootPath = parsedSiteUrl.pathname === "/" ? "/" : `${parsedSiteUrl.pathname.replace(/\/$/, "")}/`;

export const SITE_ROOT_URL = new URL(normalizedSiteRootPath, `${parsedSiteUrl.origin}/`).toString();
export const SITE_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (parsedSiteUrl.pathname === "/" ? "" : parsedSiteUrl.pathname.replace(/\/$/, ""));

function pathLooksLikeFile(pathname: string) {
  const [pathWithoutQueryOrHash] = pathname.split(/[?#]/, 1);
  const lastSegment = pathWithoutQueryOrHash.split("/").filter(Boolean).at(-1) ?? "";

  return lastSegment.includes(".");
}

export function withBasePath(pathname = "/") {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  if (pathname === "/") {
    return SITE_BASE_PATH ? `${SITE_BASE_PATH}/` : "/";
  }

  return `${SITE_BASE_PATH}${pathname}`;
}

export function absoluteUrl(pathname = "/") {
  if (pathname === "/") {
    return SITE_ROOT_URL;
  }

  const normalizedPath = pathname === "/" ? "" : pathname.replace(/\/+$/, "") || "";
  const fullPath = `${SITE_BASE_PATH}${normalizedPath}${pathLooksLikeFile(normalizedPath) ? "" : "/"}` || "/";

  return new URL(fullPath, `${parsedSiteUrl.origin}/`).toString();
}

export function assetUrl(assetPath: string) {
  const normalizedAssetPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return withBasePath(normalizedAssetPath);
}
