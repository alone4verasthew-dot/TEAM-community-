"use client";

import { useEffect, useRef } from "react";

export default function CursorSwords() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let raf = 0;
    const move = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      const dx = x - lastX;
      const dy = y - lastY;
      el.style.setProperty("--cursor-x", `${x}px`);
      el.style.setProperty("--cursor-y", `${y}px`);
      el.style.setProperty("--swing-angle", `${Math.atan2(dy, dx) * (180 / Math.PI)}deg`);
      el.style.setProperty("--swing-power", String(Math.min(1.5, Math.hypot(dx, dy) / 18)));
      el.classList.toggle("cursor-swords-moving", Math.hypot(dx, dy) > 2);
      lastX = x;
      lastY = y;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => el.classList.add("cursor-swords-visible"));
    };
    const leave = () => el.classList.remove("cursor-swords-visible");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
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
