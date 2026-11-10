import { person } from "@/app/lib/content";

export function CornerLinks() {
  return (
    <nav className="corner-links" aria-label="Profiles">
      <a className="icon-btn" href={person.github} target="_blank" rel="noreferrer" aria-label="GitHub">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.76c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
        </svg>
      </a>
      <a className="icon-btn" href={person.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.5A1.94 1.94 0 1 0 5.25 7.38 1.94 1.94 0 0 0 5.25 3.5ZM20.44 20h-3.37v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.16 1.46-2.16 2.96V20h-3.37V8.5h3.23v1.57h.05c.45-.85 1.54-1.75 3.17-1.75 3.39 0 4.01 2.23 4.01 5.13V20Z" />
        </svg>
      </a>
      <a className="icon-btn" href="/admin" aria-label="Settings">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 17.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 6.1l1.6-1.6" />
        </svg>
      </a>
    </nav>
  );
}
