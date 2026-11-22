import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { person } from "@/app/lib/content";
import { DraftMessageCard } from "./DraftMessageCard";

function parseDraftField(block: string, label: "Name" | "Email" | "Phone" | "Message" | "Token") {
  const match = block.match(new RegExp(`^${label}: ?(.*)$`, "m"));
  const value = (match?.[1] ?? "").trim();
  if (label === "Token") return value;
  if (!value || /^<.+>$/.test(value) || /^\[.+\]$/.test(value)) return "";
  if (label === "Email" && value.toLowerCase() === person.email.toLowerCase()) return "";
  return value;
}

function displayText(text: string) {
  return ensureOneBold(
    text
      .replaceAll("\u2014", ", ")
      .replaceAll("\u2013", "-")
      .replaceAll("\u2010", "-")
      .replaceAll("\u2011", "-")
      .replaceAll("\u2012", "-")
      .replaceAll("\u2015", "-")
      .replace(/[\u00a0\u202f\u2007\u2009]/g, " "),
  );
}

function ensureOneBold(text: string) {
  if (/\*\*[^*]+\*\*/.test(text)) return text;
  const match = text.match(
    /\d[\d\s,.]*\s*%(?:\s+(?:predictive\s+)?accuracy)?|\d[\d\s,]*\+\s*SKUs|R²\s*0\.\d+/i,
  );
  if (!match || match.index == null) return text;
  return `${text.slice(0, match.index)}**${match[0].trim()}**${text.slice(match.index + match[0].length)}`;
}

function inlineWithBold(block: string, takeBold: () => boolean): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(block))) {
    if (match.index > last) nodes.push(block.slice(last, match.index));
    const phrase = match[1];
    nodes.push(takeBold() ? <strong key={key++}>{phrase}</strong> : phrase);
    last = match.index + match[0].length;
  }
  if (last < block.length) nodes.push(block.slice(last));
  return nodes;
}

const REVIEW_PHRASE = "Got it once review below";

export function MarkdownReply({
  text,
  streaming,
}: {
  text: string;
  streaming?: boolean;
}) {
  const draftMatch = text.match(/```draft-message\n([\s\S]*?)\n```/);
  const draftFallback = !draftMatch && text.includes(REVIEW_PHRASE);
  const textWithoutDraft = draftMatch ? text.slice(0, draftMatch.index).trim() : text;
  const markdown = displayText(textWithoutDraft);
  const blocks = markdown.split(/\n{2,}/).filter((block) => block.trim());
  let boldAvailable = true;
  const takeBold = () => {
    if (!boldAvailable) return false;
    boldAvailable = false;
    return true;
  };

  const draftCard = draftMatch ? (
    <DraftMessageCard
      initialName={parseDraftField(draftMatch[1], "Name")}
      initialEmail={parseDraftField(draftMatch[1], "Email")}
      initialPhone={parseDraftField(draftMatch[1], "Phone")}
      initialMessage={parseDraftField(draftMatch[1], "Message")}
      initialToken={parseDraftField(draftMatch[1], "Token")}
    />
  ) : draftFallback && !streaming ? (
    <DraftMessageCard
      initialName=""
      initialEmail=""
      initialPhone=""
      initialMessage=""
      initialToken=""
    />
  ) : null;

  return (
    <div className={draftMatch || draftFallback ? "chat-reply chat-reply--draft" : "chat-reply"}>
      <div className="chat-reply__body">
        {blocks.length > 0 ? (
          blocks.map((block, blockIndex) => {
            const lines = block.split("\n").filter((line) => line.trim());
            const isList = lines.length > 1 && lines.every((line) => /^[-*]\s+/.test(line.trim()));
            if (isList) {
              return (
                <ul key={blockIndex}>
                  {lines.map((line, lineIndex) => (
                    <li key={lineIndex}>{inlineWithBold(line.trim().replace(/^[-*]\s+/, ""), takeBold)}</li>
                  ))}
                </ul>
              );
            }
            return <p key={blockIndex}>{inlineWithBold(block.replace(/\n/g, " "), takeBold)}</p>;
          })
        ) : markdown ? (
          <ReactMarkdown>{markdown}</ReactMarkdown>
        ) : null}
      </div>
      {draftCard}
      {streaming ? <span className="chat-caret" aria-hidden="true" /> : null}
    </div>
  );
}