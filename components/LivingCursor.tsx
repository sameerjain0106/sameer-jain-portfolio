"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import type { RoomId } from "@/data/spatialRooms";
import styles from "./LivingCursor.module.css";

const colors: Record<RoomId, string> = {
  entrance: "206 48 234", mri: "72 244 214", etf: "113 59 245",
  profile: "25 207 233", contact: "237 62 147",
};
const editing = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";
const clickable = "a[href]:not([aria-disabled='true']), button:not(:disabled):not([aria-disabled='true']), [role='button']:not([aria-disabled='true']), summary, [data-edge]";
// The shared silhouette begins at the real hotspot; every deformation pivots here.
const arrow = "M0 0 C2.3 1.1 4.5 2.5 6.6 4 L25.3 17.3 C27.8 19.1 27.2 21.7 24.3 22 L17.3 22.6 L21.9 31.5 C23 33.6 22.4 35.2 20.4 36.2 L19.8 36.5 C17.7 37.5 16.2 36.8 15.2 34.8 L10.7 26.3 L5.4 30.7 C3.1 32.6 .9 31.4 .8 28.5 Z";

/** An inflated glass arrow whose tip stays exactly on the pointer, without a trail or frame loop. */
export default function LivingCursor({ room, active, paused }: { room: RoomId; active: boolean; paused: boolean }) {
  const cursor = useRef<HTMLDivElement>(null);
  const id = useId();
  const glassId = `${id}-glass`, rimMaskId = `${id}-rim`;

  useEffect(() => {
    const node = cursor.current;
    const world = node?.closest<HTMLElement>("[data-world-room]");
    if (!node || !world) return;
    const positions = Array.from(node.querySelectorAll<HTMLElement>("[data-cursor-position]"));
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let supported = false, frame = 0, visible = false, disposed = false;
    let bounds = world.getBoundingClientRect();
    let point = { x: 0, y: 0, hover: false, pressed: false };
    let published = { x: Number.NaN, y: Number.NaN,
      hover: node.dataset.cursorHover === "true", pressed: node.dataset.cursorPressed === "true" };

    function hide() {
      cancelAnimationFrame(frame); frame = 0;
      node!.dataset.cursorRunning = "false";
      if (visible) {
        node!.dataset.cursorEnabled = "false";
        world!.removeAttribute("data-custom-cursor");
      }
      if (published.pressed) node!.dataset.cursorPressed = "false";
      published.pressed = false; visible = false;
    }
    function paint() {
      frame = 0;
      if (disposed || !supported || document.hidden) { hide(); return; }
      if (point.x !== published.x || point.y !== published.y) {
        const transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
        positions.forEach(position => { position.style.transform = transform; });
      }
      if (point.x !== published.x) {
        node!.dataset.cursorX = String(point.x);
      }
      if (point.y !== published.y) {
        node!.dataset.cursorY = String(point.y);
      }
      if (point.hover !== published.hover) node!.dataset.cursorHover = String(point.hover);
      if (point.pressed !== published.pressed) node!.dataset.cursorPressed = String(point.pressed);
      published = { ...point };
      node!.dataset.cursorRunning = "false";
      // Hide the platform pointer only after the replacement has its real position.
      if (!visible) {
        node!.dataset.cursorEnabled = "true";
        world!.dataset.customCursor = "true";
      }
      visible = true;
    }
    function schedule() {
      if (!frame) { node!.dataset.cursorRunning = "true"; frame = requestAnimationFrame(paint); }
    }
    function eligible(target: EventTarget | null, x: number, y: number) {
      return supported && !document.hidden && document.hasFocus() && target instanceof Element && world!.contains(target)
        && !target.closest(editing) && x >= bounds.left && x < bounds.right && y >= bounds.top && y < bounds.bottom;
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !eligible(event.target, event.clientX, event.clientY)) { hide(); return; }
      point = { x: event.clientX, y: event.clientY, pressed: event.buttons !== 0,
        hover: !!(event.target as Element).closest(clickable) };
      schedule();
    }
    function press(event: PointerEvent) {
      move(event);
      if (frame) { cancelAnimationFrame(frame); paint(); }
    }
    function leave(event: PointerEvent) {
      if (!event.relatedTarget || (event.relatedTarget instanceof Node && !world!.contains(event.relatedTarget))) hide();
    }
    function configure() {
      hide(); supported = active && fine.matches && !reduced.matches && !document.hidden;
      bounds = world!.getBoundingClientRect();
    }
    function measure() {
      bounds = world!.getBoundingClientRect();
      if (visible && (point.x < bounds.left || point.x >= bounds.right || point.y < bounds.top || point.y >= bounds.bottom)) hide();
    }
    function scroll() {
      if (!visible) return;
      const target = document.elementFromPoint(point.x, point.y);
      if (!eligible(target, point.x, point.y)) { hide(); return; }
      const hover = !!target?.closest(clickable);
      if (point.hover !== hover) { point.hover = hover; schedule(); }
    }
    function keyboard(event: KeyboardEvent) { if (event.key === "Tab") hide(); }

    world.classList.add(styles.cursorHost);
    const observer = new ResizeObserver(measure); observer.observe(world);
    configure();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", press, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", hide); window.addEventListener("focus", configure);
    window.addEventListener("keydown", keyboard);
    world.addEventListener("scroll", scroll, { passive: true, capture: true });
    document.addEventListener("visibilitychange", configure);
    fine.addEventListener("change", configure); reduced.addEventListener("change", configure);
    return () => {
      disposed = true; hide(); observer.disconnect(); world.classList.remove(styles.cursorHost);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", press); window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", hide); window.removeEventListener("focus", configure);
      window.removeEventListener("keydown", keyboard); world.removeEventListener("scroll", scroll, true);
      document.removeEventListener("visibilitychange", configure);
      fine.removeEventListener("change", configure); reduced.removeEventListener("change", configure);
    };
  }, [active]);

  return <div ref={cursor} className={styles.cursor} data-living-cursor data-cursor-enabled="false" data-cursor-hover="false"
    data-cursor-running="false" data-active={active} data-paused={paused} aria-hidden="true"
    style={{ "--cursor-color": colors[room] } as CSSProperties}>
    <span className={styles.position} data-cursor-position><span className={styles.bubble}>
      <svg className={styles.shell} width="28" height="38" viewBox="0 0 28 38" focusable="false" data-cursor-arrow>
        <defs>
          <radialGradient id={glassId} cx="18%" cy="18%" r="100%">
            <stop offset="0" stopColor="white" stopOpacity=".88" />
            <stop offset=".28" stopColor="white" stopOpacity=".28" />
            <stop offset=".5" stopColor="currentColor" stopOpacity=".28" />
            <stop offset=".8" stopColor="currentColor" stopOpacity=".72" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".95" />
          </radialGradient>
        </defs>
        <path d={arrow} className={styles.halo} />
        <path d={arrow} className={styles.keyline} />
        <path d={arrow} className={styles.glass} fill={`url(#${glassId})`} />
        <path d={arrow} className={styles.innerRim} />
        <path d="M3.3 7.1 C3.6 12.7 4 17.6 4.4 21.4" className={styles.glint} />
        <path d="M8.7 7.7 C12.8 9.7 18.3 13.5 21.9 16.6" className={styles.reflection} />
      </svg>
    </span></span>
    <span className={styles.contrastPosition} data-cursor-position><span className={styles.bubble}>
      <svg className={styles.contrastShell} width="28" height="38" viewBox="0 0 28 38" focusable="false">
        <defs>
          <mask id={rimMaskId} maskUnits="userSpaceOnUse" x="-4" y="-4" width="36" height="46">
            <path d={arrow} fill="white" stroke="white" strokeWidth="5.5" strokeLinejoin="round" />
            <path d={arrow} fill="black" stroke="black" strokeWidth="3.5" strokeLinejoin="round" />
          </mask>
        </defs>
        <path d={arrow} className={styles.contrastRim} mask={`url(#${rimMaskId})`} data-cursor-contrast />
      </svg>
    </span></span>
    <span className={styles.point} data-cursor-point data-cursor-position />
  </div>;
}
