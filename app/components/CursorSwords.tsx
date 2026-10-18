"use client";

import { useEffect, useRef } from "react";

type Stroke = { x1: number; y1: number; x2: number; y2: number; born: number; width: number };

export default function CursorSwords() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let previous: { x: number; y: number } | null = null;
    const strokes: Stroke[] = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event: PointerEvent) => {
      const point = { x: event.clientX, y: event.clientY };
      if (previous) {
        const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
        if (distance > 1.5) {
          strokes.push({
            x1: previous.x, y1: previous.y, x2: point.x, y2: point.y,
            born: performance.now(), width: 1.8 + Math.random() * 0.8,
          });
          // Tiny hand-drawn flicks make the trail feel like a red pen doodle.
          if (distance > 5 && Math.random() > 0.58) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const length = 4 + Math.random() * 9;
            strokes.push({
              x1: point.x, y1: point.y,
              x2: point.x + (Math.random() - 0.5) * length,
              y2: point.y + side * length,
              born: performance.now(), width: 1.1 + Math.random() * 0.6,
            });
          }
        }
      }
      previous = point;
    };

    const leave = () => { previous = null; };
    const draw = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i];
        const age = now - stroke.born;
        if (age > 650) {
          strokes.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, 1 - age / 650);
        ctx.strokeStyle = "#ff1737";
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(stroke.x1, stroke.y1);
        ctx.lineTo(stroke.x2, stroke.y2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-doodle-canvas" aria-hidden="true" />;
}
