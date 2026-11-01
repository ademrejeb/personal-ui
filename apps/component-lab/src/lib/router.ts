import { useEffect, useState } from "react";

export type Route =
  | { view: "overview" }
  | { view: "tokens" }
  | { view: "theme" }
  | { view: "component"; id: string };

function parse(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  const [segment, param] = clean.split("/");
  if (segment === "tokens") return { view: "tokens" };
  if (segment === "theme") return { view: "theme" };
  if (segment === "components" && param) return { view: "component", id: decodeURIComponent(param) };
  return { view: "overview" };
}

function read(): Route {
  return parse(typeof window === "undefined" ? "" : window.location.hash);
}

/** Minimal hash-based router — no external routing dependency. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export function navigate(path: string): void {
  if (typeof window === "undefined") return;
  const next = path.startsWith("#") ? path : `#${path.startsWith("/") ? "" : "/"}${path}`;
  if (window.location.hash === next) return;
  window.location.hash = next;
}
