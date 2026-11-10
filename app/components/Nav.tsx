"use client";

import { navLinks } from "@/app/lib/content";
import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <a href="#top" className="wordmark">
          Prakhar Dwivedi
        </a>
        <nav className="site-nav__links" aria-label="Sections">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="icon-btn site-nav__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>
      {open ? (
        <nav className="site-nav__panel" aria-label="Sections">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
