"use client";

import { useEffect } from "react";

/** Slower than native `scroll-behavior: smooth` (~0.5–0.8s). Tune here. */
const DURATION_MS = 2200;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getScrollTargetY(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const scrollMargin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return window.scrollY + rect.top - scrollMargin;
}

export function SmoothAnchorScroll() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const link = (e.target as Element | null)?.closest("a[href*='#']");
      if (!link || !(link instanceof HTMLAnchorElement)) return;

      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }

      if (url.pathname !== window.location.pathname) return;
      const hash = url.hash;
      if (!hash || hash === "#") return;

      const id = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        target.scrollIntoView({ block: "start" });
        history.pushState(null, "", hash);
        return;
      }

      const startY = window.scrollY;
      const endY = getScrollTargetY(target);
      const delta = endY - startY;
      const t0 = performance.now();

      function step(now: number) {
        const elapsed = now - t0;
        const t = Math.min(elapsed / DURATION_MS, 1);
        window.scrollTo(0, startY + delta * easeInOutCubic(t));
        if (t < 1) requestAnimationFrame(step);
        else history.pushState(null, "", hash);
      }

      requestAnimationFrame(step);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
