"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { RoomId } from "@/data/spatialRooms";
import styles from "./LivingCursor.module.css";

const colors: Record<RoomId, string> = {
  entrance: "91 67 224", mri: "255 158 116", etf: "36 73 220",
  profile: "36 73 220", contact: "40 133 120",
};
const editing = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

/** A precise pointer inside a gently living shell. No trailing position or frame loop. */
export default function LivingCursor({ room, active, paused }: { room: RoomId; active: boolean; paused: boolean }) {
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = cursor.current;
    const world = node?.closest<HTMLElement>("[data-world-room]");
    if (!node || !world) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let supported = false, frame = 0, visible = false, disposed = false;
    let bounds = world.getBoundingClientRect();
    let point = { x: 0, y: 0, hover: false, pressed: false };

    function hide() {
      cancelAnimationFrame(frame); frame = 0; visible = false;
      node!.dataset.cursorEnabled = "false";
      node!.dataset.cursorRunning = "false";
      node!.dataset.cursorPressed = "false";
      world!.removeAttribute("data-custom-cursor");
    }
    function paint() {
      frame = 0;
      if (disposed || !supported || document.hidden) { hide(); return; }
      node!.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
      node!.dataset.cursorX = String(point.x); node!.dataset.cursorY = String(point.y);
      node!.dataset.cursorHover = String(point.hover);
      node!.dataset.cursorPressed = String(point.pressed);
      node!.dataset.cursorRunning = "false";
      // Hide the platform pointer only after the replacement has its real position.
      visible = true;
      node!.dataset.cursorEnabled = "true";
      world!.dataset.customCursor = "true";
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
        hover: !!(event.target as Element).closest("a[href], button, [role='button'], summary, [data-edge]") };
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
      point.hover = !!target?.closest("a[href], button, [role='button'], summary, [data-edge]");
      schedule();
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
    <span className={styles.bubble}><span className={styles.shell}><i /></span></span>
    <span className={styles.point} data-cursor-point />
  </div>;
}
