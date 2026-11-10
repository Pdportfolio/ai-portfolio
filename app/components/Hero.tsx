"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionEnabled } from "./AmbientField";
import { Avatar } from "./Avatar";
import { useChat } from "./ChatContext";
import { MarkdownReply } from "./MarkdownReply";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const PROMPTS = [
  {
    label: "Me",
    question: "Tell me about yourself and your experience as an AI/ML Engineer.",
    icon: (
      <svg {...iconProps} stroke="#329696">
        <circle cx="12" cy="12" r="10" />
        <path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z" />
        <line x1="9" x2="9.01" y1="9" y2="9" />
        <line x1="15" x2="15.01" y1="9" y2="9" />
      </svg>
    ),
  },
  {
    label: "Projects",
    question: "What projects have you built?",
    icon: (
      <svg {...iconProps} stroke="#3E9858">
        <path d="M12 12h.01" />
        <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M22 13a18.15 18.15 0 0 1-20 0" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </svg>
    ),
  },
  {
    label: "Skills",
    question: "What skills and tools do you work with?",
    icon: (
      <svg {...iconProps} stroke="#856ED9">
        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
        <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
        <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
      </svg>
    ),
  },
  {
    label: "Education",
    question: "What is your educational background?",
    icon: (
      <svg {...iconProps} stroke="#4F86C6">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 8.983a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      </svg>
    ),
  },
  {
    label: "Certifications",
    question: "What certifications do you have?",
    icon: (
      <svg {...iconProps} stroke="#B95F9D">
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        <circle cx="12" cy="8" r="6" />
      </svg>
    ),
  },
  {
    label: "Contact",
    question: "How can I get in touch with you?",
    icon: (
      <svg {...iconProps} stroke="#C19433">
        <circle cx="10" cy="8" r="5" />
        <path d="M2 21a8 8 0 0 1 10.434-7.62" />
        <circle cx="18" cy="18" r="3" />
        <path d="m22 22-1.9-1.9" />
      </svg>
    ),
  },
] as const;

const lineSpring = { type: "spring" as const, duration: 0.62, bounce: 0.12 };

function ThinkingDots() {
  return (
    <span className="chat-thinking__dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function Hero({
  role,
  focusBlurb,
  openToWork,
}: {
  role: string;
  focusBlurb: string;
  openToWork: boolean;
}) {
  const reduce = !useMotionEnabled();
  const { ask, retry, messages, status, error, isActive } = useChat();
  const [query, setQuery] = useState("");
  const [pillsOpen, setPillsOpen] = useState(true);
  const [slow, setSlow] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const busy = status === "thinking" || status === "streaming";
  const thinking = status === "thinking";

  useEffect(() => {
    if (!thinking) {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), 3000);
    return () => window.clearTimeout(timer);
  }, [thinking]);

  useEffect(() => {
    const node = threadRef.current;
    if (!node) return;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [messages, status, error, reduce]);

  function submitQuestion(question: string) {
    const next = question.trim();
    if (!next || busy) return;
    setQuery("");
    ask(next);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(query);
  }

  return (
    <section id="top" className={isActive ? "hero hero--chat" : "hero"} aria-busy={busy}>
      <div className="hero__identity">
        <AnimatePresence>
          {!isActive ? (
            <motion.div
              className="hero__intro"
              initial={false}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={reduce ? { duration: 0.12 } : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <motion.p
                className="hero__hello"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0.12 } : { ...lineSpring, delay: 0.08 }}
              >
                <span>Hey, I&apos;m Prakhar 👋</span>
                {openToWork ? <span className="hero__otw">Open to work</span> : null}
              </motion.p>
              <motion.h1
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0.12 } : { ...lineSpring, delay: 0.16 }}
              >
                {role}
              </motion.h1>
              {focusBlurb ? (
                <motion.p
                  className="hero__focus"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduce ? { duration: 0.12 } : { ...lineSpring, delay: 0.24 }}
                >
                  {focusBlurb}
                </motion.p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div className="hero__avatar-wrap">
          <motion.div
            animate={reduce || isActive ? { y: 0, scale: 1 } : { y: [0, -6, 0], scale: [1, 1.02, 1] }}
            transition={
              reduce || isActive
                ? { duration: 0.3 }
                : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <Avatar />
          </motion.div>
        </motion.div>
      </div>

      <div className="hero__copy">
        <AnimatePresence>
          {isActive ? (
            <motion.div
              className="chat-thread"
              ref={threadRef}
              data-lenis-prevent
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={reduce ? { duration: 0.12 } : { duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="chat-thread__stack">
                {messages.map((message) =>
                  message.role === "user" ? (
                    <p className="chat-bubble" key={message.id}>
                      {message.text}
                    </p>
                  ) : (
                    <MarkdownReply
                      key={message.id}
                      text={message.text}
                      streaming={status === "streaming" && message === messages.at(-1)}
                    />
                  ),
                )}
                {thinking ? (
                  <p className="chat-thinking chat-thinking--in-thread" aria-live="polite">
                    <ThinkingDots />
                    {slow ? "Taking longer than expected…" : "Thinking"}
                  </p>
                ) : null}
                {status === "error" && error ? (
                  <div className="chat-error" role="alert">
                    <p>{error}</p>
                    <button className="btn btn--ghost btn--small" type="button" onClick={retry}>
                      Try again
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="hero__dock">
          {isActive ? (
            <button
              type="button"
              className="ask-pills__toggle"
              aria-expanded={pillsOpen}
              onClick={() => setPillsOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {pillsOpen ? <path d="m6 9 6 6 6-6" /> : <path d="m6 15 6-6 6 6" />}
              </svg>
              {pillsOpen ? "Hide quick questions" : "Show quick questions"}
            </button>
          ) : null}
          <motion.form
            className="ask-bar"
            onSubmit={onSubmit}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0.12 } : { ...lineSpring, delay: 0.4 }}
          >
            <label className="visually-hidden" htmlFor="ask">
              Ask me anything
            </label>
            <input
              id="ask"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask me anything…"
              autoComplete="off"
              disabled={busy}
            />
            <button
              className="ask-submit"
              type="submit"
              aria-label="Submit question"
              disabled={busy || !query.trim()}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </motion.form>
          <div className="ask-pills-slot">
            <AnimatePresence initial={false}>
              {!isActive || pillsOpen ? (
                <motion.div
                  className="ask-pills"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  transition={
                    isActive
                      ? reduce
                        ? { duration: 0.12 }
                        : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }
                      : reduce
                        ? { duration: 0.12 }
                        : { ...lineSpring, delay: 0.52 }
                  }
                >
                  {PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      className="ask-pill"
                      data-prompt={prompt.question}
                      disabled={busy}
                      onClick={() => submitQuestion(prompt.question)}
                    >
                      {prompt.icon}
                      <span>{prompt.label}</span>
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
