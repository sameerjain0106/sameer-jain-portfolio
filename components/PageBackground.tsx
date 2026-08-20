"use client";

import { useEffect, useRef } from "react";

interface Layer {
  color: string;
  seed: number;
  points: number[];
  bandTop: number; // 0-1, fraction of viewport height
  bandHeight: number; // 0-1
  speed: number; // px/frame
  strokeAlpha: number;
  fillAlpha: number;
}

const POINTS_PER_PATTERN = 48;
const TEAL = "77, 216, 196";
const AMBER = "217, 164, 91";

function generateWalk(n: number, seed: number) {
  let value = 0.5;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const points: number[] = [];
  for (let i = 0; i < n; i++) {
    value += (rand() - 0.5) * 0.16;
    value = Math.max(0.06, Math.min(0.94, value));
    points.push(value);
  }
  // Seamless-loop fix: the pattern repeats by drawing two copies side by
  // side and scrolling them together. Without this, each copy is an
  // independent random walk, so the endpoint doesn't match the start —
  // producing a visible jump/discontinuity once per cycle. Blending the
  // last quarter of points back toward the first point's value makes the
  // wrap invisible.
  const target = points[0];
  const blendStart = Math.floor(n * 0.75);
  for (let i = blendStart; i < n; i++) {
    const t = (i - blendStart) / (n - 1 - blendStart);
    points[i] = points[i] * (1 - t) + target * t;
  }
  return points;
}

export default function PageBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationFrame: number;

    const layers: Layer[] = [
      { color: TEAL, seed: 11, points: generateWalk(POINTS_PER_PATTERN, 11), bandTop: 0.04, bandHeight: 0.3, speed: 0.16, strokeAlpha: 0.16, fillAlpha: 0.05 },
      { color: AMBER, seed: 27, points: generateWalk(POINTS_PER_PATTERN, 27), bandTop: 0.38, bandHeight: 0.28, speed: 0.11, strokeAlpha: 0.12, fillAlpha: 0.04 },
      { color: TEAL, seed: 53, points: generateWalk(POINTS_PER_PATTERN, 53), bandTop: 0.7, bandHeight: 0.28, speed: 0.13, strokeAlpha: 0.13, fillAlpha: 0.04 },
    ];
    const offsets = layers.map(() => 0);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const patternWidth = () => Math.max(width, 900);
    const step = () => patternWidth() / (POINTS_PER_PATTERN - 1);

    // Build a smooth path (quadratic curve through midpoints) for one copy
    // of a layer's pattern, starting at xStart.
    const buildPath = (layer: Layer, xStart: number) => {
      const top = layer.bandTop * height;
      const bandH = layer.bandHeight * height;
      const yFor = (v: number) => top + (1 - v) * bandH;
      const s = step();

      const coords = layer.points.map((v, i) => ({ x: xStart + i * s, y: yFor(v) }));

      const path = new Path2D();
      path.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length - 1; i++) {
        const midX = (coords[i].x + coords[i + 1].x) / 2;
        const midY = (coords[i].y + coords[i + 1].y) / 2;
        path.quadraticCurveTo(coords[i].x, coords[i].y, midX, midY);
      }
      const last = coords[coords.length - 1];
      path.lineTo(last.x, last.y);
      return { path, coords, top, bandH };
    };

    const drawLayer = (layer: Layer, offset: number) => {
      const pw = patternWidth();
      [-offset, -offset + pw].forEach((xStart) => {
        const { path, coords, top, bandH } = buildPath(layer, xStart);

        // area fill under the curve
        const fillPath = new Path2D(path);
        const lastX = coords[coords.length - 1].x;
        const firstX = coords[0].x;
        fillPath.lineTo(lastX, top + bandH);
        fillPath.lineTo(firstX, top + bandH);
        fillPath.closePath();

        const gradient = ctx.createLinearGradient(0, top, 0, top + bandH);
        gradient.addColorStop(0, `rgba(${layer.color}, ${layer.fillAlpha})`);
        gradient.addColorStop(1, `rgba(${layer.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill(fillPath);

        // the line itself
        ctx.strokeStyle = `rgba(${layer.color}, ${layer.strokeAlpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke(path);

        // glowing markers at local extrema
        for (let i = 2; i < coords.length - 2; i += 5) {
          const isExtremum =
            (coords[i].y < coords[i - 2].y && coords[i].y < coords[i + 2].y) ||
            (coords[i].y > coords[i - 2].y && coords[i].y > coords[i + 2].y);
          if (!isExtremum) continue;
          ctx.beginPath();
          ctx.arc(coords[i].x, coords[i].y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${layer.color}, 0.35)`;
          ctx.shadowColor = `rgba(${layer.color}, 0.6)`;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      layers.forEach((layer, i) => {
        drawLayer(layer, offsets[i]);
        if (!prefersReducedMotion) {
          offsets[i] += layer.speed;
          if (offsets[i] >= patternWidth()) offsets[i] -= patternWidth();
        }
      });
      if (!prefersReducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
