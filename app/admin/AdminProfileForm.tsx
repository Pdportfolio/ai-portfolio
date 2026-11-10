"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { LiveProfile } from "../lib/profile-types";

function bulletsToText(bullets: string[]) {
  return bullets.join("\n");
}

function textToBullets(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function AdminProfileForm({ initial }: { initial: LiveProfile }) {
  const router = useRouter();
  const [role, setRole] = useState(initial.role);
  const [focusBlurb, setFocusBlurb] = useState(initial.focusBlurb);
  const [openToWork, setOpenToWork] = useState(initial.openToWork);
  const [positionTitle, setPositionTitle] = useState(initial.currentPosition?.title ?? "");
  const [positionCompany, setPositionCompany] = useState(initial.currentPosition?.company ?? "");
  const [positionBullets, setPositionBullets] = useState(bulletsToText(initial.currentPosition?.bullets ?? []));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "cleared" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function currentPositionFromForm() {
    const title = positionTitle.trim();
    const company = positionCompany.trim();
    const bullets = textToBullets(positionBullets);
    if (!title && !company && bullets.length === 0) return null;
    if (!title || !company) return false;
    return { title, company, bullets };
  }

  async function save(next: LiveProfile, savedStatus: "saved" | "cleared") {
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (response.status === 401) {
        router.refresh();
        return;
      }
      if (!response.ok) {
        setStatus("error");
        setError("Could not save.");
        return;
      }
      setStatus(savedStatus);
    } catch {
      setStatus("error");
      setError("Could not save.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving") return;
    const currentPosition = currentPositionFromForm();
    if (currentPosition === false) {
      setStatus("error");
      setError("Current position needs both a title and a company, or leave both empty.");
      return;
    }
    await save(
      {
        role: role.trim(),
        focusBlurb: focusBlurb.trim(),
        openToWork,
        currentPosition,
      },
      "saved",
    );
  }

  async function clearCurrentPosition() {
    if (status === "saving") return;
    setPositionTitle("");
    setPositionCompany("");
    setPositionBullets("");
    await save(
      {
        role: role.trim(),
        focusBlurb: focusBlurb.trim(),
        openToWork,
        currentPosition: null,
      },
      "cleared",
    );
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <form className="admin-card" onSubmit={onSubmit}>
      <div className="admin-card__head">
        <h1>Live profile</h1>
        <button className="btn btn--ghost btn--small" type="button" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
      <label htmlFor="admin-role">Role</label>
      <input
        id="admin-role"
        type="text"
        value={role}
        onChange={(event) => setRole(event.target.value)}
        maxLength={80}
        required
      />
      <label htmlFor="admin-focus">Focus blurb</label>
      <textarea
        id="admin-focus"
        value={focusBlurb}
        onChange={(event) => setFocusBlurb(event.target.value)}
        maxLength={240}
        rows={3}
      />
      <label className="admin-toggle" htmlFor="admin-otw">
        <input
          id="admin-otw"
          type="checkbox"
          checked={openToWork}
          onChange={(event) => setOpenToWork(event.target.checked)}
        />
        Open to work
      </label>

      <div className="admin-section">
        <div className="admin-section__head">
          <h2>Current position</h2>
          <button className="btn btn--ghost btn--small" type="button" onClick={() => void clearCurrentPosition()}>
            Clear current position
          </button>
        </div>
        <p className="admin-hint">Leave empty to use the experience list as-is. Each line in the description becomes one bullet.</p>
        <label htmlFor="admin-job-title">Title</label>
        <input
          id="admin-job-title"
          type="text"
          value={positionTitle}
          onChange={(event) => setPositionTitle(event.target.value)}
          maxLength={80}
        />
        <label htmlFor="admin-job-company">Company</label>
        <input
          id="admin-job-company"
          type="text"
          value={positionCompany}
          onChange={(event) => setPositionCompany(event.target.value)}
          maxLength={80}
        />
        <label htmlFor="admin-job-bullets">Description</label>
        <textarea
          id="admin-job-bullets"
          value={positionBullets}
          onChange={(event) => setPositionBullets(event.target.value)}
          rows={5}
          placeholder="One bullet per line"
        />
      </div>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {status === "saved" ? <p className="admin-ok">Saved. Homepage and chat pick this up immediately.</p> : null}
      {status === "cleared" ? <p className="admin-ok">Current position cleared. Chat uses the experience list again.</p> : null}
      <button className="btn" type="submit" disabled={status === "saving" || !role.trim()}>
        {status === "saving" ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
