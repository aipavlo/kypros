type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

function normalizeAppPath(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/{2,}/g, "/");
}

function buildQueryString(params?: QueryParams) {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === false || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function buildAppRoute(pathname: string, params?: QueryParams) {
  return `${normalizeAppPath(pathname)}${buildQueryString(params)}`;
}

export const appRoutes = {
  home: () => "/",
  welcome: () => "/welcome",
  dashboard: () => "/dashboard",
  easyStart: () => "/easy-start",
  lessons: (params?: QueryParams) => buildAppRoute("/lessons", params),
  lesson: (lessonId: string, params?: QueryParams) => buildAppRoute(`/lessons/${lessonId}`, params),
  cyprus: (params?: QueryParams) => buildAppRoute("/cyprus", params),
  tracks: () => "/tracks",
  trails: (params?: QueryParams) => buildAppRoute("/trails", params),
  phrasebook: (params?: QueryParams) => buildAppRoute("/phrasebook", params),
  flashcards: (params?: QueryParams) => buildAppRoute("/flashcards", params),
  quiz: (params?: QueryParams) => buildAppRoute("/quiz", params),
  achievements: () => "/achievements",
  sitemap: () => "/sitemap",
  humor: () => "/humor",
  content: () => "/content"
};
