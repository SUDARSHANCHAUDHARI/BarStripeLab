"use client";

import { useEffect, useRef } from "react";

interface ScanLineProps {
  // Each time this turns true, one laser pass crosses the line.
  pass: boolean;
}

// The signature motif under the number field. Laser red appears only while it moves, never as a resting state.
export default function ScanLine({ pass }: ScanLineProps) {
  const head = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = head.current;
    if (!pass || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = el.animate(
      [
        { transform: "translateX(0)", opacity: 1 },
        { transform: "translateX(300%)", opacity: 1, offset: 0.9 },
        { transform: "translateX(300%)", opacity: 0 },
      ],
      { duration: 700, easing: "cubic-bezier(.2,.7,.2,1)" }
    );
    return () => animation.cancel();
  }, [pass]);

  return (
    <div aria-hidden="true" className="relative my-4 h-0.5 rounded-full bg-rule">
      <span
        ref={head}
        className="absolute -top-px left-0 h-1 w-1/4 rounded-full bg-laser opacity-0 shadow-[0_0_10px_1px] shadow-laser/50"
      />
    </div>
  );
}
