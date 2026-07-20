/** Match storefront nav href against current pathname (+ optional query for PLP filters). */
export function isNavActive(
  pathname: string,
  href: string,
  search = "",
): boolean {
  if (href === "/" || href.startsWith("/?")) {
    if (pathname !== "/") {
      return false;
    }

    const [, query = ""] = href.split("?");
    const normalizedSearch = search.startsWith("?") ? search.slice(1) : search;

    if (!query) {
      return normalizedSearch === "" || normalizedSearch === "sleeve=short";
    }

    return normalizedSearch === query;
  }

  if (href.startsWith("/products")) {
    return pathname === "/products" || pathname.startsWith("/products/");
  }

  const pathOnly = href.split("?")[0] ?? href;

  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}
