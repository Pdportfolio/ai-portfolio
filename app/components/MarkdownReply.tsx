import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

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

export function MarkdownReply({
  text,
  streaming,
}: {
  text: string;
  streaming?: boolean;
}) {
  const markdown = displayText(text);
  const blocks = markdown.split(/\n{2,}/).filter((block) => block.trim());
  let boldAvailable = true;
  const takeBold = () => {
    if (!boldAvailable) return false;
    boldAvailable = false;
    return true;
  };

  return (
    <div className="chat-reply">
      <div className="chat-reply__body">
        {blocks.length > 0 ? (
          blocks.map((block, index) => <p key={index}>{inlineWithBold(block.replace(/\n/g, " "), takeBold)}</p>)
        ) : (
          <ReactMarkdown>{markdown}</ReactMarkdown>
        )}
      </div>
      {streaming ? <span className="chat-caret" aria-hidden="true" /> : null}
    </div>
  );
}
