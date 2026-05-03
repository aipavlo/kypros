import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";
import { buildAppRoute } from "@/src/lib/routes";

type AppLinkProps = RouterLinkProps;

export function AppLink({ to, ...props }: AppLinkProps) {
  const normalizedTo = typeof to === "string" && to.startsWith("/") ? buildAppRoute(to) : to;

  return <RouterLink {...props} to={normalizedTo} />;
}
