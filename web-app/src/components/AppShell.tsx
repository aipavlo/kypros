import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

type AppShellProps = {
  children: ReactNode;
};

type NavigationItem = {
  isActive: (pathname: string, search: string) => boolean;
  label: string;
  to: string;
};

function isEasyStartContext(pathname: string, search: string) {
  if (pathname.startsWith("/easy-start")) {
    return true;
  }

  if (!pathname.startsWith("/lessons/")) {
    return false;
  }

  return new URLSearchParams(search).get("source") === "easy_start";
}

const PRIMARY_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Главная", to: "/", isActive: (pathname) => pathname === "/" },
  {
    label: "Учёба",
    to: "/lessons",
    isActive: (pathname, search) => pathname.startsWith("/lessons") && !isEasyStartContext(pathname, search)
  },
  { label: "Повторение", to: "/flashcards", isActive: (pathname) => pathname.startsWith("/flashcards") },
  { label: "Проверить знания", to: "/quiz", isActive: (pathname) => pathname.startsWith("/quiz") },
  { label: "Кипр", to: "/cyprus", isActive: (pathname) => pathname.startsWith("/cyprus") },
  { label: "Прогресс", to: "/achievements", isActive: (pathname) => pathname.startsWith("/achievements") }
];

const SECONDARY_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Лёгкий старт",
    to: "/easy-start",
    isActive: (pathname, search) => isEasyStartContext(pathname, search)
  },
  { label: "Маршруты", to: "/trails", isActive: (pathname) => pathname.startsWith("/trails") },
  { label: "Программа", to: "/tracks", isActive: (pathname) => pathname.startsWith("/tracks") },
  { label: "О сервисе", to: "/welcome", isActive: (pathname) => pathname.startsWith("/welcome") }
];

const EXTRA_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Юмор", to: "/humor", isActive: (pathname) => pathname.startsWith("/humor") },
  { label: "Библиотека", to: "/content", isActive: (pathname) => pathname.startsWith("/content") }
];

function renderNavigationLinks(items: NavigationItem[], pathname: string, search: string) {
  return items.map(({ isActive, label, to }) => (
    <Link key={to} to={to} className={isActive(pathname, search) ? "active" : undefined}>
      {label}
    </Link>
  ));
}

export function AppShell({ children }: AppShellProps) {
  const { pathname, search } = useLocation();

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand brand-link" to="/">
          <span className="brand-mark">KP</span>
          <div>
            <strong>Kypros Path</strong>
            <p>Греческий язык и подготовка по Кипру</p>
          </div>
        </Link>

        <div className="nav-group">
          <p className="nav-label">Главное</p>
          <nav className="nav">{renderNavigationLinks(PRIMARY_NAVIGATION_ITEMS, pathname, search)}</nav>
        </div>

        <div className="nav-group">
          <p className="nav-label">Дополнительно</p>
          <nav className="nav">{renderNavigationLinks(SECONDARY_NAVIGATION_ITEMS, pathname, search)}</nav>
        </div>

        <div className="nav-group nav-group-quiet">
          <p className="nav-label">Ещё</p>
          <nav className="nav nav-quiet">{renderNavigationLinks(EXTRA_NAVIGATION_ITEMS, pathname, search)}</nav>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
