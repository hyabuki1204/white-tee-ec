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
    if (pathname !== "/products") {
      return false;
    }

    const [, query = ""] = href.split("?");

    if (!query) {
      return search === "" || search === "?";
    }

    const normalizedSearch = search.startsWith("?") ? search.slice(1) : search;
    return normalizedSearch === query;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavDropdownActive(
  pathname: string,
  href: string,
  search: string,
  childHrefs?: { href: string }[],
): boolean {
  if (isNavActive(pathname, href, search)) {
    return true;
  }

  return childHrefs?.some((child) => isNavActive(pathname, child.href, search)) ?? false;
}
