declare module "../../app/api/app/access/route.js" {
  export { GET } from "../../app/api/app/access/route";
}

declare module "../../app/api/app/progress/route.js" {
  export { GET, PUT } from "../../app/api/app/progress/route";
}

declare module "../../app/api/app/context/last-opened/route.js" {
  export { GET, PUT } from "../../app/api/app/context/last-opened/route";
}

declare module "../../app/api/app/session/route.js" {
  export { GET, createSessionGetHandler } from "../../app/api/app/session/route";
}

declare module "../../app/api/auth/login/route.js" {
  export { POST } from "../../app/api/auth/login/route";
}

declare module "../../app/api/auth/logout/route.js" {
  export { POST } from "../../app/api/auth/logout/route";
}
