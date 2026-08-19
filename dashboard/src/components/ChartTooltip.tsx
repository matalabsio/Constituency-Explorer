"use client";

import { useState, type MouseEvent } from "react";

type Tip = { text: string; x: number; y: number };

export function useChartHover() {
  const [tip, setTip] = useState<Tip | null>(null);

  const show = (event: MouseEvent, text: string) => {
    setTip({ text, x: event.clientX, y: event.clientY });
  };

  const move = (event: MouseEvent) => {
    setTip((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : current));
  };

  const hide = () => setTip(null);

  return { tip, show, move, hide };
}

export function ChartHoverTip({ tip }: { tip: Tip | null }) {
  if (!tip) return null;

  const left = Math.min(tip.x + 14, typeof window !== "undefined" ? window.innerWidth - 220 : tip.x + 14);
  const top = Math.min(tip.y + 16, typeof window !== "undefined" ? window.innerHeight - 72 : tip.y + 16);

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[70] max-w-[13rem] rounded-md bg-[var(--brand-black)] px-2.5 py-1.5 text-xs font-medium leading-snug text-white shadow-[var(--shadow-md)]"
      style={{ left, top }}
    >
      {tip.text}
    </div>
  );
}
