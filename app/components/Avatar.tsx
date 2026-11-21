"use client";

import { useChat } from "./ChatContext";

export function Avatar() {
  const { reset, isActive } = useChat();

  return (
    <button
      type="button"
      className="hero__avatar"
      onClick={() => {
        reset();
        document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      aria-label={isActive ? "Back to home" : "Scroll to top"}
    >
      <img src="/images/prakhar-3d.png?v=meta3d3" alt="" width={460} height={460} />
    </button>
  );
}