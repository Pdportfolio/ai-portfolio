"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionEnabled } from "./AmbientField";
import { useTheme } from "./ThemeProvider";

function canRunFluid() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(pointer: fine)").matches) return false;
  return true;
}

export function FluidBackground() {
  const motionEnabled = useMotionEnabled();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!motionEnabled) {
      setEnabled(false);
      return;
    }

    const sync = () => setEnabled(canRunFluid());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [motionEnabled]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const origRaf = window.requestAnimationFrame.bind(window);
    const origCancel = window.cancelAnimationFrame.bind(window);
    const pending = new Set<number>();
    const listeners: Array<() => void> = [];

    const ignoreFluidKeys = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space" || event.code === "KeyP") {
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("keydown", ignoreFluidKeys);
    listeners.push(() => window.removeEventListener("keydown", ignoreFluidKeys));

    window.requestAnimationFrame = (callback) => {
      const id = origRaf((time) => {
        pending.delete(id);
        if (!cancelled) callback(time);
      });
      pending.add(id);
      return id;
    };

    const narrow = window.innerWidth < 900;
    const wide = window.innerWidth >= 1200;
    let splat = { r: 0.7, g: 0.35, b: 0.85 };
    const options = {
      IMMEDIATE: false,
      AUTO: false,
      TRIGGER: "hover" as const,
      SIM_RESOLUTION: narrow ? 96 : 128,
      DYE_RESOLUTION: wide ? 1024 : 512,
      DENSITY_DISSIPATION: 0.38,
      VELOCITY_DISSIPATION: 2.2,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: wide ? 18 : 10,
      CURL: 2.5,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 5200,
      SHADING: true,
      COLORFUL: true,
      COLOR_UPDATE_SPEED: 10,
      SPLAT_COLOR: {
        get r() {
          const hue = Math.random();
          const i = Math.floor(hue * 6);
          const f = hue * 6 - i;
          const q = 1 - f;
          const rgb =
            i === 0
              ? [1, f, 0]
              : i === 1
                ? [q, 1, 0]
                : i === 2
                  ? [0, 1, f]
                  : i === 3
                    ? [0, q, 1]
                    : i === 4
                      ? [f, 0, 1]
                      : [1, 0, q];
          splat = { r: rgb[0] * 0.78, g: rgb[1] * 0.78, b: rgb[2] * 0.78 };
          return splat.r;
        },
        get g() {
          return splat.g;
        },
        get b() {
          return splat.b;
        },
      },
      BACK_COLOR:
        theme === "dark" ? { r: 9, g: 9, b: 11 } : { r: 255, g: 255, b: 255 },
      TRANSPARENT: false,
      BLOOM: false,
      SUNRAYS: false,
    };

    void import("webgl-fluid").then((mod) => {
      if (cancelled || !canvasRef.current) return;
      mod.default(canvas, options);

      let primed = false;

      const relayToCanvas = (type: "mousedown" | "mousemove" | "mouseup", event: PointerEvent | MouseEvent) => {
        const target = canvasRef.current;
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const synthetic = new MouseEvent(type, {
          clientX: event.clientX,
          clientY: event.clientY,
          bubbles: false,
          cancelable: false,
        });
        Object.defineProperties(synthetic, {
          offsetX: { get: () => offsetX },
          offsetY: { get: () => offsetY },
        });
        target.dispatchEvent(synthetic);
      };

      const releasePointer = () => {
        if (!primed) return;
        relayToCanvas("mouseup", new MouseEvent("mouseup"));
        primed = false;
      };

      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        primed = true;
        relayToCanvas("mousedown", event);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        if (!primed) {
          primed = true;
          relayToCanvas("mousedown", event);
        }
        relayToCanvas("mousemove", event);
      };

      const attachRelay = window.setTimeout(() => {
        if (cancelled) return;
        window.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });
        window.addEventListener("pointermove", onPointerMove, { passive: true, capture: true });
        window.addEventListener("pointerup", releasePointer, { passive: true, capture: true });
        window.addEventListener("pointercancel", releasePointer, { passive: true, capture: true });
        window.addEventListener("blur", releasePointer);
        listeners.push(() => {
          window.removeEventListener("pointerdown", onPointerDown, { capture: true });
          window.removeEventListener("pointermove", onPointerMove, { capture: true });
          window.removeEventListener("pointerup", releasePointer, { capture: true });
          window.removeEventListener("pointercancel", releasePointer, { capture: true });
          window.removeEventListener("blur", releasePointer);
        });
      }, 505);
      listeners.push(() => window.clearTimeout(attachRelay));
    });

    return () => {
      cancelled = true;
      pending.forEach((id) => origCancel(id));
      pending.clear();
      window.requestAnimationFrame = origRaf;
      window.cancelAnimationFrame = origCancel;
      listeners.forEach((off) => off());
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [enabled, theme]);

  if (!enabled) return null;

  return (
    <div className="fluid-bg" aria-hidden="true">
      <canvas id="fluid" ref={canvasRef} />
    </div>
  );
}