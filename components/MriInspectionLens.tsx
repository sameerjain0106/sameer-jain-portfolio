"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./MriInspectionLens.module.css";

type MriInspectionLensProps = {
  children: ReactNode;
  className?: string;
  active?: boolean;
};

const zoom = 2.25;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Magnifies the displayed source image, including its existing crop and object-fit. */
export default function MriInspectionLens({ children, className = "", active = true }: MriInspectionLensProps) {
  const root = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const detail = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = root.current;
    const glass = lens.current;
    const copy = detail.current;
    if (!active || !host || !glass || !copy) return;
    const image = host.querySelector("img");
    const corners = host.querySelectorAll<HTMLElement>("[data-inspection-corner]");
    if (!image || corners.length !== 3) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    let mode: "mouse" | "keyboard" | null = null;
    let clientX = 0;
    let clientY = 0;
    let keyboardX = .5;
    let keyboardY = .5;
    let stableFrames = 0;
    let previousGeometry = "";
    let source = "";

    function stop() {
      mode = null;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      host!.dataset.inspecting = "false";
      window.removeEventListener("scroll", stop, true);
      window.removeEventListener("wheel", stop, true);
      window.removeEventListener("resize", stop);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    }

    function schedule() {
      if (frame === null && mode) frame = requestAnimationFrame(render);
    }

    function begin(nextMode: "mouse" | "keyboard") {
      if (!mode) {
        window.addEventListener("scroll", stop, { capture: true, passive: true });
        window.addEventListener("wheel", stop, { capture: true, passive: true });
        window.addEventListener("resize", stop, { passive: true });
        window.addEventListener("blur", stop);
        document.addEventListener("visibilitychange", stop);
      }
      mode = nextMode;
      stableFrames = 0;
      schedule();
    }

    function render() {
      frame = null;
      if (!mode || document.hidden || host!.closest('[aria-hidden="true"], [data-active="false"]')) { stop(); return; }
      // Three points recover local coordinates even inside the rotated scene plates.
      // A bounding rectangle alone would drift as their existing parallax moves.
      const origin = corners[0].getBoundingClientRect();
      const horizontal = corners[1].getBoundingClientRect();
      const vertical = corners[2].getBoundingClientRect();
      const hostStyle = getComputedStyle(host!);
      const width = parseFloat(hostStyle.width);
      const height = parseFloat(hostStyle.height);
      if (!width || !height || !image!.naturalWidth || !image!.naturalHeight) { stop(); return; }
      const ax = (horizontal.left - origin.left) / width;
      const ay = (horizontal.top - origin.top) / width;
      const bx = (vertical.left - origin.left) / height;
      const by = (vertical.top - origin.top) / height;
      const determinant = ax * by - ay * bx;
      if (Math.abs(determinant) < .0001) { stop(); return; }
      const toLocal = (x: number, y: number) => ({
        x: ((x - origin.left) * by - (y - origin.top) * bx) / determinant,
        y: ((y - origin.top) * ax - (x - origin.left) * ay) / determinant,
      });

      const imageBox = image!.getBoundingClientRect();
      const imageStyle = getComputedStyle(image!);
      const number = (value: string) => parseFloat(value) || 0;
      const paddingX = number(imageStyle.paddingLeft) + number(imageStyle.paddingRight);
      const paddingY = number(imageStyle.paddingTop) + number(imageStyle.paddingBottom);
      const borderX = number(imageStyle.borderLeftWidth) + number(imageStyle.borderRightWidth);
      const borderY = number(imageStyle.borderTopWidth) + number(imageStyle.borderBottomWidth);
      const borderBox = imageStyle.boxSizing === "border-box";
      const imageWidth = number(imageStyle.width) + (borderBox ? 0 : paddingX + borderX);
      const imageHeight = number(imageStyle.height) + (borderBox ? 0 : paddingY + borderY);
      const contentWidth = imageWidth - paddingX - borderX;
      const contentHeight = imageHeight - paddingY - borderY;
      const imageCenter = toLocal(imageBox.left + imageBox.width / 2, imageBox.top + imageBox.height / 2);
      const fitScale = Math.min(contentWidth / image!.naturalWidth, contentHeight / image!.naturalHeight);
      const fit = imageStyle.objectFit;
      const scale = fit === "cover" ? Math.max(contentWidth / image!.naturalWidth, contentHeight / image!.naturalHeight)
        : fit === "none" ? 1 : fit === "scale-down" ? Math.min(1, fitScale) : fitScale;
      const drawnWidth = fit === "fill" ? contentWidth : image!.naturalWidth * scale;
      const drawnHeight = fit === "fill" ? contentHeight : image!.naturalHeight * scale;
      const position = imageStyle.objectPosition.split(" ");
      const offset = (value: string, space: number) => value.endsWith("%") ? number(value) / 100 * space : number(value);
      const drawnLeft = imageCenter.x - imageWidth / 2 + number(imageStyle.paddingLeft) + number(imageStyle.borderLeftWidth) + offset(position[0] ?? "50%", contentWidth - drawnWidth);
      const drawnTop = imageCenter.y - imageHeight / 2 + number(imageStyle.paddingTop) + number(imageStyle.borderTopWidth) + offset(position[1] ?? "50%", contentHeight - drawnHeight);
      const left = Math.max(0, drawnLeft);
      const top = Math.max(0, drawnTop);
      const right = Math.min(width, drawnLeft + drawnWidth);
      const bottom = Math.min(height, drawnTop + drawnHeight);
      const diameter = Math.min(104, (right - left) * .72, (bottom - top) * .8);
      if (diameter < 24) { stop(); return; }
      const radius = diameter / 2;
      const point = mode === "mouse" ? toLocal(clientX, clientY) : {
        x: left + (right - left) * keyboardX,
        y: top + (bottom - top) * keyboardY,
      };
      if (mode === "mouse" && (point.x < left || point.x > right || point.y < top || point.y > bottom)) { stop(); return; }
      const x = clamp(point.x, left + radius, right - radius);
      const y = clamp(point.y, top + radius, bottom - radius);
      const nextSource = image!.currentSrc || image!.src;

      // Only this small, clipped pair of layers moves. No React renders or filters.
      if (source !== nextSource) {
        source = nextSource;
        copy!.style.backgroundImage = `url(${JSON.stringify(source)})`;
      }
      glass!.style.width = `${diameter}px`;
      glass!.style.height = `${diameter}px`;
      glass!.style.transform = `translate3d(${x - radius}px, ${y - radius}px, 0)`;
      copy!.style.width = `${drawnWidth * zoom}px`;
      copy!.style.height = `${drawnHeight * zoom}px`;
      copy!.style.transform = `translate3d(${radius - (x - drawnLeft) * zoom}px, ${radius - (y - drawnTop) * zoom}px, 0)`;
      glass!.dataset.sourceX = ((x - drawnLeft) / drawnWidth).toFixed(5);
      glass!.dataset.sourceY = ((y - drawnTop) / drawnHeight).toFixed(5);
      host!.dataset.inspecting = "true";

      // Follow existing ancestor parallax only until it settles; never run at idle.
      const geometry = `${origin.left.toFixed(2)},${origin.top.toFixed(2)},${horizontal.left.toFixed(2)},${horizontal.top.toFixed(2)},${vertical.left.toFixed(2)},${vertical.top.toFixed(2)}`;
      stableFrames = geometry === previousGeometry ? stableFrames + 1 : 0;
      previousGeometry = geometry;
      if (mode === "mouse" && !reducedMotion.matches && stableFrames < 3) schedule();
    }

    function pointer(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !finePointer.matches) return;
      clientX = event.clientX;
      clientY = event.clientY;
      begin("mouse");
    }
    function focus() {
      if (!host!.matches(":focus-visible")) return;
      keyboardX = .5;
      keyboardY = .5;
      begin("keyboard");
    }
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") { stop(); return; }
      const dx = event.key === "ArrowLeft" ? -.08 : event.key === "ArrowRight" ? .08 : 0;
      const dy = event.key === "ArrowUp" ? -.08 : event.key === "ArrowDown" ? .08 : 0;
      if (!dx && !dy) return;
      event.preventDefault();
      keyboardX = clamp(keyboardX + dx, 0, 1);
      keyboardY = clamp(keyboardY + dy, 0, 1);
      begin("keyboard");
    }
    host.addEventListener("pointerenter", pointer, { passive: true });
    host.addEventListener("pointermove", pointer, { passive: true });
    host.addEventListener("pointerleave", stop);
    host.addEventListener("pointercancel", stop);
    host.addEventListener("focus", focus);
    host.addEventListener("blur", stop);
    host.addEventListener("keydown", key);
    finePointer.addEventListener("change", stop);
    reducedMotion.addEventListener("change", stop);
    return () => {
      stop();
      host.removeEventListener("pointerenter", pointer);
      host.removeEventListener("pointermove", pointer);
      host.removeEventListener("pointerleave", stop);
      host.removeEventListener("pointercancel", stop);
      host.removeEventListener("focus", focus);
      host.removeEventListener("blur", stop);
      host.removeEventListener("keydown", key);
      finePointer.removeEventListener("change", stop);
      reducedMotion.removeEventListener("change", stop);
    };
  }, [active]);

  return <div ref={root} className={`${styles.inspection} ${className}`} data-mri-inspection data-enabled={active} data-inspecting="false" tabIndex={active ? 0 : -1} role="group" aria-label="Figure inspection. Use arrow keys to move the magnifier; Escape to hide it.">
    {children}
    <span data-inspection-corner className={styles.origin} aria-hidden="true" />
    <span data-inspection-corner className={styles.horizontal} aria-hidden="true" />
    <span data-inspection-corner className={styles.vertical} aria-hidden="true" />
    <span ref={lens} className={styles.lens} data-mri-lens data-zoom={zoom} aria-hidden="true">
      <span ref={detail} className={styles.detail} />
      <span className={styles.reticle} />
      <span className={styles.zoom}>{zoom}×</span>
    </span>
  </div>;
}
