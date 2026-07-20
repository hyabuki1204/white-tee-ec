"use client";

import { useEffect } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * One-shot scroll reveal for storefront sections / `[data-reveal]`.
 * Above-the-fold blocks are marked revealed immediately to avoid a flash.
 */
export function RevealObserver({ rootId = "main-content" }: { rootId?: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId) ?? document.body;

    const collect = () => {
      const nodes = new Set<Element>();
      root.querySelectorAll("section, [data-reveal]").forEach((node) => {
        nodes.add(node);
      });
      return [...nodes];
    };

    const targets = collect();

    if (prefersReducedMotion()) {
      targets.forEach((node) => {
        node.setAttribute("data-reveal", "");
        node.setAttribute("data-revealed", "");
      });
      document.documentElement.setAttribute("data-reveal-ready", "");
      return;
    }

    const fold = window.innerHeight * 0.92;

    targets.forEach((node) => {
      node.setAttribute("data-reveal", "");
      const top = node.getBoundingClientRect().top;
      if (top < fold) {
        node.setAttribute("data-revealed", "");
      }
    });

    document.documentElement.setAttribute("data-reveal-ready", "");

    const revealed = new WeakSet<Element>();
    targets.forEach((node) => {
      if (node.hasAttribute("data-revealed")) {
        revealed.add(node);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || revealed.has(entry.target)) continue;
          revealed.add(entry.target);
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );

    const observePending = () => {
      collect().forEach((node) => {
        node.setAttribute("data-reveal", "");
        if (revealed.has(node) || node.hasAttribute("data-revealed")) return;
        const top = node.getBoundingClientRect().top;
        if (top < fold && top > -node.getBoundingClientRect().height) {
          revealed.add(node);
          node.setAttribute("data-revealed", "");
          return;
        }
        observer.observe(node);
      });
    };

    observePending();

    const mutation = new MutationObserver(() => observePending());
    mutation.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [rootId]);

  return null;
}
