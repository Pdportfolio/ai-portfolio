"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Could not sign in.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={onSubmit}>
      <h1>Admin</h1>
      <label htmlFor="admin-password">Password</label>
      <input
        id="admin-password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={busy}
        required
      />
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn" type="submit" disabled={busy || !password}>
        Sign in
      </button>
    </form>
  );
}
