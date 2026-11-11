"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content remains readable without animation or JavaScript. */
export default function JournalMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("journal-entered");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    const elements = document.querySelectorAll("[data-reveal]");
    elements.forEach((element, index) => {
      (element as HTMLElement).style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 60}ms`);
      element.classList.add("journal-reveal-ready");
      observer.observe(element);
    });
    const reduce = () => { if (motion.matches) elements.forEach((element) => element.classList.add("journal-entered")); };
    motion.addEventListener("change", reduce);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", reduce);
      elements.forEach((element) => element.classList.remove("journal-reveal-ready"));
    };
  }, [pathname]);
  return null;
}
