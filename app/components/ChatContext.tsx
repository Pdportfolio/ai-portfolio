"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type ChatStatus = "idle" | "thinking" | "streaming" | "error";

type ChatContextValue = {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  isActive: boolean;
  ask: (question: string) => void;
  retry: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);
const FIRST_TOKEN_MS = 90_000;

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function messageFromError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "The assistant took too long to reply. Try again.";
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Couldn't reach the assistant. Try again in a moment.";
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const lastQuestionRef = useRef<string | null>(null);
  const pendingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (question: string, appendUser: boolean) => {
    const next = question.trim();
    if (!next || pendingRef.current) return;

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), FIRST_TOKEN_MS);

    pendingRef.current = true;
    lastQuestionRef.current = next;
    setError(null);
    setStatus("thinking");

    let nextMessages = messagesRef.current;
    if (appendUser) {
      nextMessages = [...nextMessages, { id: nextId(), role: "user", text: next }];
    } else {
      const last = nextMessages.at(-1);
      if (last?.role === "assistant") nextMessages = nextMessages.slice(0, -1);
    }
    messagesRef.current = nextMessages;
    setMessages(nextMessages);

    const payload = nextMessages
      .filter((message) => message.text.trim())
      .slice(-8)
      .map((message) => ({ role: message.role, content: message.text }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
        signal: abort.signal,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "The assistant could not reply.");
      }
      if (!response.body) {
        throw new Error("The assistant couldn't reply just now. Try again in a moment.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      let assistantId: string | null = null;

      const writeAssistant = (id: string, snapshot: string) => {
        messagesRef.current = messagesRef.current.map((message) =>
          message.id === id ? { ...message, text: snapshot } : message,
        );
        setMessages(messagesRef.current);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (!assistantId) {
          window.clearTimeout(timeout);
          assistantId = nextId();
          text = chunk;
          const id = assistantId;
          const created: ChatMessage = { id, role: "assistant", text };
          messagesRef.current = [...messagesRef.current, created];
          setStatus("streaming");
          setMessages(messagesRef.current);
          continue;
        }

        text += chunk;
        writeAssistant(assistantId, text);
      }

      text += decoder.decode();
      window.clearTimeout(timeout);

      if (!text.trim()) {
        throw new Error("The assistant couldn't reply just now. Try again in a moment.");
      }

      if (assistantId) writeAssistant(assistantId, text);
      setStatus("idle");
    } catch (caught) {
      window.clearTimeout(timeout);
      setStatus("error");
      setError(messageFromError(caught));
    } finally {
      pendingRef.current = false;
    }
  }, []);

  const ask = useCallback(
    (question: string) => {
      void send(question, true);
    },
    [send],
  );

  const retry = useCallback(() => {
    const last = lastQuestionRef.current;
    if (!last) return;
    void send(last, false);
  }, [send]);

  const value = useMemo(
    () => ({
      messages,
      status,
      error,
      isActive: messages.length > 0 || status !== "idle",
      ask,
      retry,
    }),
    [messages, status, error, ask, retry],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
