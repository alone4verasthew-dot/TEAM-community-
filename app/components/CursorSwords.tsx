"use client";

import { useEffect, useRef } from "react";

type Drop = { x: number; y: number; vx: number; vy: number; radius: number; born: number; life: number; maxLife: number };
type Ring = { x: number; y: number; born: number; life: number };

export default function CursorSwords() {
  const inkRef = useRef<HTMLCanvasElement>(null);
  const emberRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ink = inkRef.current;
    const embers = emberRef.current;
    const glow = glowRef.current;
    const inkCtx = ink?.getContext("2d");
    const emberCtx = embers?.getContext("2d");
    if (!ink || !embers || !glow || !inkCtx || !emberCtx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let previous: { x: number; y: number } | null = null;
    let pointer = { x: width * 0.5, y: height * 0.5 };
    const drops: Drop[] = [];
    const rings: Ring[] = [];
    const particles = Array.from({ length: reduced ? 0 : 68 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.5 + Math.random() * 1.6,
      speed: 0.12 + Math.random() * 0.48,
      drift: (Math.random() - 0.5) * 0.25,
      phase: Math.random() * Math.PI * 2,
    }));

    const sizeCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeCanvas(ink, inkCtx);
      sizeCanvas(embers, emberCtx);
      for (const p of particles) {
        p.x = Math.min(width, p.x);
        p.y = Math.min(height, p.y);
      }
    };

    const addDrop = (x: number, y: number, radius: number, vx: number, vy: number, life: number) => {
      drops.push({ x, y, vx, vy, radius, born: performance.now(), life, maxLife: life });
      if (drops.length > 360) drops.splice(0, drops.length - 360);
    };

    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      glow.style.left = pointer.x + "px";
      glow.style.top = pointer.y + "px";
      glow.style.opacity = finePointer ? "1" : "0";
      if (reduced) return;

      if (previous) {
        const dx = pointer.x - previous.x;
        const dy = pointer.y - previous.y;
        const distance = Math.hypot(dx, dy);
        const steps = Math.min(10, Math.ceil(distance / 4));
        for (let i = 1; i <= steps; i++) {
          const t = i / Math.max(steps, 1);
          const x = previous.x + dx * t;
          const y = previous.y + dy * t;
          addDrop(x, y, 1.8 + Math.random() * 3.4, (Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.18, 260 + Math.random() * 360);
          if (distance > 8 && Math.random() > 0.7) {
            addDrop(x, y, 0.8 + Math.random() * 1.8, (Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.5, 220 + Math.random() * 220);
          }
        }
      }
      previous = pointer;
    };

    const splat = (event: PointerEvent) => {
      if (reduced || event.pointerType === "mouse" && event.button !== 0) return;
      const x = event.clientX;
      const y = event.clientY;
      addDrop(x, y, 10 + Math.random() * 7, 0, 0, 520);
      for (let i = 0; i < 34; i++) {
        const angle = (Math.PI * 2 * i) / 34 + Math.random() * 0.2;
        const speed = 0.8 + Math.random() * 4.7;
        addDrop(x + Math.cos(angle) * (2 + Math.random() * 8), y + Math.sin(angle) * (2 + Math.random() * 8), 1.4 + Math.random() * 5.5, Math.cos(angle) * speed, Math.sin(angle) * speed, 360 + Math.random() * 600);
      }
      rings.push({ x, y, born: performance.now(), life: 680 });
      if (rings.length > 8) rings.shift();
    };

    const leave = () => {
      previous = null;
      glow.style.opacity = "0";
    };

    const renderInk = (now: number) => {
      inkCtx.clearRect(0, 0, width, height);
      inkCtx.save();
      inkCtx.globalCompositeOperation = "lighter";
      for (let i = drops.length - 1; i >= 0; i--) {
        const p = drops[i];
        const age = now - p.born;
        const t = age / p.life;
        if (t >= 1) { drops.splice(i, 1); continue; }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        const r = p.radius * Math.max(0.12, 1 - t * 0.7);
        const grad = inkCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.6);
        grad.addColorStop(0, "rgba(255,55,73," + (0.82 * (1 - t)) + ")");
        grad.addColorStop(0.35, "rgba(224,18,31," + (0.48 * (1 - t)) + ")");
        grad.addColorStop(1, "rgba(224,18,31,0)");
        inkCtx.fillStyle = grad;
        inkCtx.beginPath();
        inkCtx.arc(p.x, p.y, r * 2.6, 0, Math.PI * 2);
        inkCtx.fill();
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        const t = (now - ring.born) / ring.life;
        if (t >= 1) { rings.splice(i, 1); continue; }
        const radius = 14 + t * 175;
        inkCtx.globalAlpha = 1 - t;
        inkCtx.strokeStyle = "#ff2a38";
        inkCtx.lineWidth = Math.max(0.5, 2.6 - t * 2);
        inkCtx.beginPath();
        inkCtx.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
        inkCtx.stroke();
      }
      inkCtx.restore();
    };

    const renderEmbers = (now: number) => {
      emberCtx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(now * 0.001 + p.phase) * 0.14;
        if (p.y < -8) { p.y = height + 8; p.x = Math.random() * width; }
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        const flicker = 0.25 + (Math.sin(now * 0.002 + p.phase) + 1) * 0.25;
        emberCtx.globalAlpha = flicker;
        emberCtx.fillStyle = p.radius > 1.6 ? "#ff9b91" : "#ff263f";
        emberCtx.shadowColor = "#ff1737";
        emberCtx.shadowBlur = 9;
        emberCtx.beginPath();
        emberCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        emberCtx.fill();
      }
      emberCtx.globalAlpha = 1;
      emberCtx.shadowBlur = 0;
    };

    const updateCamera = () => {
      if (reduced) return;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      const mx = (pointer.x / Math.max(1, width) - 0.5) * 2;
      const my = (pointer.y / Math.max(1, height) - 0.5) * 2;
      const layers: Array<{ selector: string; depth: number; scale: number }> = [
        { selector: ".moon", depth: 9, scale: 0.3 },
        { selector: ".mountain-back", depth: 16, scale: 0.16 },
        { selector: ".mountain-front", depth: 24, scale: 0.22 },
        { selector: ".torii", depth: 28, scale: 2.7 },
        { selector: ".pagoda", depth: 18, scale: 0.12 },
        { selector: ".ronin", depth: 36, scale: -0.55 },
      ];
      for (const layer of layers) {
        const el = document.querySelector<HTMLElement>(layer.selector);
        if (!el) continue;
        const scale = layer.selector === ".torii"
          ? 1 + progress * layer.scale
          : layer.selector === ".ronin"
            ? Math.max(0.45, 1 + progress * layer.scale)
            : 1 + progress * layer.scale;
        el.style.translate = (mx * layer.depth) + "px " + (my * layer.depth - progress * layer.depth * (layer.selector === ".ronin" ? 1.4 : 0.15)) + "px";
        el.style.scale = String(scale);
        if (layer.selector === ".torii") el.style.opacity = String(progress < 0.62 ? 0.72 : Math.max(0, 0.72 * (1 - (progress - 0.62) / 0.28)));
      }
      const root = document.querySelector<HTMLElement>(".samurai-world");
      if (root) root.style.setProperty("--camera-progress", String(progress));
    };

    const draw = (now: number) => {
      if (!reduced) {
        renderInk(now);
        renderEmbers(now);
        updateCamera();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", splat, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", splat);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      const root = document.querySelector<HTMLElement>(".samurai-world");
      root?.style.removeProperty("--camera-progress");
      for (const selector of [".moon", ".mountain-back", ".mountain-front", ".torii", ".pagoda", ".ronin"]) {
        const el = document.querySelector<HTMLElement>(selector);
        if (el) { el.style.removeProperty("translate"); el.style.removeProperty("scale"); }
      }
    };
  }, []);

  return (
    <>
      <canvas ref={emberRef} className="embers-canvas" aria-hidden="true" />
      <canvas ref={inkRef} className="cursor-doodle-canvas" aria-hidden="true" />
      <div ref={glowRef} className="ink-cursor-glow" aria-hidden="true" />
    </>
  );
}
