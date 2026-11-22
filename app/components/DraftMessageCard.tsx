"use client";

import { useState } from "react";

export function DraftMessageCard({
  initialName,
  initialEmail,
  initialPhone,
  initialMessage,
  initialToken,
}: {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialMessage: string;
  initialToken: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState(initialMessage);
  const [token] = useState(initialToken);
  const [state, setState] = useState<"editing" | "sending" | "sent" | "cancelled" | "error">("editing");
  const [errorReason, setErrorReason] = useState<string | null>(null);

  const tokenReady = token.trim().length > 0;
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSend =
    tokenReady && name.trim().length > 0 && emailLooksValid && message.trim().length > 0;

  async function handleSend() {
    setState("sending");
    setErrorReason(null);
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, token }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (body?.ok) {
        setState("sent");
      } else {
        setErrorReason(body?.error ?? null);
        setState("error");
      }
    } catch {
      setErrorReason(null);
      setState("error");
    }
  }

  if (state === "sent") return <p className="admin-ok">Message sent to Prakhar.</p>;
  if (state === "cancelled") return null;

  if (!tokenReady) {
    return (
      <p className="admin-error">Couldn&apos;t prepare this message, try asking again.</p>
    );
  }

  return (
    <div className="admin-card">
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={state === "sending"}
        />
      </label>
      <label>
        Email
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={state === "sending"}
        />
      </label>
      <label>
        Phone
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="for a quick call"
          disabled={state === "sending"}
        />
      </label>
      <label>
        Message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required disabled={state === "sending"} />
      </label>
      {state === "error" ? (
        <p className="admin-error">
          {errorReason === "rate_limited"
            ? "You're sending too fast, try again in a few minutes."
            : errorReason === "unavailable"
              ? "Message sending is temporarily unavailable, try again shortly."
              : "Couldn't send that, double-check the name, email, and message."}
        </p>
      ) : null}
      <div className="admin-card__head">
        <button type="button" className="btn btn--small" disabled={!canSend || state === "sending"} onClick={handleSend}>
          {state === "sending" ? "Sending..." : "Send"}
        </button>
        <button type="button" className="btn btn--ghost btn--small" disabled={state === "sending"} onClick={() => setState("cancelled")}>
          Cancel
        </button>
      </div>
    </div>
  );
}