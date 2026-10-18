"use client";

import { useEffect, useRef } from "react";

export default function CursorSwords() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    let x = window.innerWidth * 0.55;
    let y = window.innerHeight * 0.45;
    let targetX = x;
    let targetY = y;
    let angle = 0;
    let lastX = x;
    let lastY = y;
    const move = (event: PointerEvent) => {
      targetX = event.clientX + 74;
      targetY = event.clientY + 30;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      angle = Math.atan2(dy, dx) * (180 / Math.PI);
      el.style.setProperty("--swing-angle", `${angle}deg`);
      el.classList.toggle("cursor-swords-moving", Math.hypot(dx, dy) > 2);
      el.classList.add("cursor-swords-visible");
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const animate = () => {
      x += (targetX - x) * 0.075;
      y += (targetY - y) * 0.075;
      el.style.setProperty("--cursor-x", `${x}px`);
      el.style.setProperty("--cursor-y", `${y}px`);
      raf = requestAnimationFrame(animate);
    };
    const leave = () => el.classList.remove("cursor-swords-visible");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={root} className="cursor-swords" aria-hidden="true">
    <span className="cursor-sword cursor-sword-a"><i /></span>
    <span className="cursor-sword cursor-sword-b"><i /></span>
    <span className="cursor-cross-flash" />
  </div>;
}
