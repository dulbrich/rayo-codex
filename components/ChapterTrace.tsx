"use client";

import { useEffect, useRef } from "react";

/** Four π pairs control the twist, rotation and two radii of the chapter's wireframe. */
function drawTrace(canvas: HTMLCanvasElement, pairs: number[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const tau = Math.PI * 2;
  const phase = pairs[0] / 100 * tau;
  const rotate = -.45 + pairs[1] / 150;
  const radius = .28 + pairs[2] / 450;
  const twist = .18 + pairs[3] / 220;

  function point(u: number, v: number) {
    const ring = 1 + .12 * Math.cos(3 * u + phase);
    const tube = radius * (1 + .11 * Math.sin(2 * u + phase));
    const x = (ring + tube * Math.cos(v)) * Math.cos(u + rotate);
    const y = (ring + tube * Math.cos(v)) * Math.sin(u + rotate);
    const z = twist * Math.sin(2 * u + phase) + tube * Math.sin(v);
    return [x + .18 * y, .42 * y - .79 * z - .12 * x];
  }

  const extent = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  for (let u = 0; u < 48; u++) {
    for (let v = 0; v < 20; v++) {
      const [x, y] = point(tau * u / 48, tau * v / 20);
      extent.left = Math.min(extent.left, x);
      extent.right = Math.max(extent.right, x);
      extent.top = Math.min(extent.top, y);
      extent.bottom = Math.max(extent.bottom, y);
    }
  }
  const scale = Math.min((width - 10) / (extent.right - extent.left), (height - 10) / (extent.bottom - extent.top));
  const centerX = width / 2 - scale * (extent.right + extent.left) / 2;
  const centerY = height / 2 - scale * (extent.bottom + extent.top) / 2;

  const curve = (count: number, sample: (angle: number) => number[]) => {
    ctx.beginPath();
    for (let i = 0; i <= count; i++) {
      const [x, y] = sample(tau * i / count);
      if (i === 0) ctx.moveTo(centerX + x * scale, centerY + y * scale);
      else ctx.lineTo(centerX + x * scale, centerY + y * scale);
    }
    ctx.stroke();
  };

  ctx.lineWidth = .7;
  for (let strand = 0; strand < 66; strand++) {
    const u = tau * strand / 66;
    ctx.strokeStyle = "rgba(148, 239, 202, " + (.39 + .32 * Math.cos(u - 1)) + ")";
    curve(56, v => point(u, v));
  }
  ctx.lineWidth = .6;
  ctx.strokeStyle = "rgba(163, 240, 211, .29)";
  for (let strand = 0; strand < 14; strand++) {
    const v = tau * strand / 14;
    curve(100, u => point(u, v));
  }
}

export default function ChapterTrace({ seed }: { seed: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pairs = seed.match(/../g) ?? [];
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const values = (seed.match(/../g) ?? []).map(Number);
    const paint = () => drawTrace(element, values);
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(element);
    return () => observer.disconnect();
  }, [seed]);

  return <figure className="chapter-trace" aria-label={"Chapter trace from π digit pairs " + pairs.join(", ")}>
    <canvas ref={canvas} aria-hidden="true" />
    <figcaption><span>π trace</span> {pairs.join(" · ")}</figcaption>
  </figure>;
}
