"use client";

import { useState } from "react";

export function DraftMessageCard({
  initialName,
  initialEmail,
  initialPhone,
  initialMessage,
}: {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialMessage: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState(initialMessage);
  const [state, setState] = useState<"editing" | "sending" | "sent" | "cancelled" | "error">("editing");

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSend =
    name.trim().length > 0 && emailLooksValid && phone.trim().length > 0 && message.trim().length > 0;

  async function handleSend() {
    setState("sending");
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      setState(body?.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") return <p className="admin-ok">Message sent to Prakhar.</p>;
  if (state === "cancelled") return null;

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
          required
          disabled={state === "sending"}
        />
      </label>
      <label>
        Message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required disabled={state === "sending"} />
      </label>
      {state === "error" ? <p className="admin-error">Could not send, try again.</p> : null}
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
