"use client";

import { useReducedMotion } from "framer-motion";
import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return children;
  }

  return (
    <ReactLenis root options={{ lerp: 0.08, wheelMultiplier: 0.85, touchMultiplier: 1 }}>
      {children}
    </ReactLenis>
  );
}
