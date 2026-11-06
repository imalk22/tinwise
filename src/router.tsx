import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/** Every page on the site, in nav order. */
export const PATHS = ["/", "/tin", "/calculators", "/tools", "/calendar", "/learn"] as const;
export type PagePath = (typeof PATHS)[number];

/** Which page each section id lives on, so "#salary" works from anywhere. */
export const SECTION_PAGE: Record<string, PagePath> = {
  top: "/",
  stats: "/",
  check: "/tin",
  guide: "/tin",
  help: "/tin",
  salary: "/calculators",
  annual: "/calculators",
  interest: "/calculators",
  tools: "/tools",
  calendar: "/calendar",
  glossary: "/learn",
  faq: "/learn",
};

const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p) || "/";

type Router = { path: string; navigate: (to: string) => void };
const RouterContext = createContext<Router | null>(null);

export function useRouter() {
  const r = useContext(RouterContext);
  if (!r) throw new Error("useRouter must be used inside RouterProvider");
  return r;
}

/** Scrolls to the element named by the URL hash, or to the top. Runs after the page has rendered. */
export function scrollToHash(smooth = false) {
  const id = decodeURIComponent(location.hash.slice(1));
  requestAnimationFrame(() => {
    const el = id ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "start" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  });
}

/**
 * Tiny history-API router. Plain <a href="/tin"> and <a href="#salary"> links work
 * everywhere: a document-level click handler turns them into in-app navigation.
 */
export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalize(location.pathname));

  const navigate = useCallback((to: string) => {
    const url = new URL(to, location.href);
    let next = normalize(url.pathname);
    const hash = url.hash.slice(1);
    // A bare "#section" link pointing at another page: go to that page.
    if (to.startsWith("#") && hash && SECTION_PAGE[hash]) next = SECTION_PAGE[hash];
    const target = next + (hash ? `#${hash}` : "");
    if (target === location.pathname + location.hash) {
      scrollToHash(true);
      return;
    }
    const samePage = next === normalize(location.pathname);
    history.pushState(null, "", target);
    setPath(next);
    if (samePage) scrollToHash(true);
  }, []);

  useEffect(() => {
    const onPop = () => {
      setPath(normalize(location.pathname));
      scrollToHash();
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || !(href.startsWith("/") || href.startsWith("#")) || href.startsWith("//")) return;
      // Same-page anchors keep native smooth scrolling.
      if (href.startsWith("#")) {
        const owner = SECTION_PAGE[href.slice(1)];
        if (!owner || owner === normalize(location.pathname)) return;
      }
      e.preventDefault();
      navigate(href);
    };
    addEventListener("popstate", onPop);
    document.addEventListener("click", onClick);
    return () => {
      removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
    };
  }, [navigate]);

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}
