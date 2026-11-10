import { groq } from "@ai-sdk/groq";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { getRecentActivity } from "../../lib/github";
import { sendVisitorMessage } from "../../lib/mail";
import { buildSystemPrompt } from "../../lib/prompt";
import { clientIp } from "../../lib/request-ip";

export const maxDuration = 90;

// Confirmed live on Groq's production list (fast tier, ~1000 t/s).
// Llama 3.1/3.3 IDs are enterprise-only for free/developer accounts as of Aug 2026.
const MODEL_ID = "openai/gpt-oss-20b";
const HISTORY_LIMIT = 8;

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

function asTurns(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return [];
  const turns: ChatTurn[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role === "user" || role === "assistant") && typeof content === "string" && content.trim()) {
      turns.push({ role, content: content.trim() });
    }
  }
  return turns.slice(-HISTORY_LIMIT);
}

export async function POST(request: Request) {
  // GROQ_API_KEY must be set in .env.local and in Vercel → Project Settings → Environment Variables.
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "Chat is not configured. Add GROQ_API_KEY in the environment." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }

  const messages = asTurns((body as { messages?: unknown }).messages);
  const last = messages.at(-1);
  if (!last || last.role !== "user") {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }

  const ip = clientIp(request);

  try {
    const result = streamText({
      model: groq(MODEL_ID),
      system: await buildSystemPrompt(),
      messages,
      temperature: 0.2,
      maxOutputTokens: 1024,
      abortSignal: request.signal,
      stopWhen: stepCountIs(5),
      tools: {
        sendMessage: tool({
          description:
            "Email Prakhar a visitor message. Call only with explicit intent plus name, contact email, and body.",
          inputSchema: z.object({
            name: z.string(),
            email: z.string(),
            message: z.string(),
          }),
          execute: async ({ name, email, message }) =>
            sendVisitorMessage({ name, email, message, ip }),
        }),
        getRecentActivity: tool({
          description:
            "Recently pushed public GitHub repos (name, description, url, pushedAt). Use for GitHub activity, not current job.",
          inputSchema: z.object({}),
          execute: async () => {
            const activity = await getRecentActivity();
            return {
              source: "live GitHub activity",
              repos: activity.map((repo) => ({
                name: repo.name,
                description: repo.description,
                url: repo.url,
                pushedAt: repo.pushedAt,
              })),
            };
          },
        }),
      },
      onFinish({ totalUsage, usage }) {
        const input = totalUsage?.inputTokens ?? usage?.inputTokens;
        const output = totalUsage?.outputTokens ?? usage?.outputTokens;
        const total = totalUsage?.totalTokens ?? usage?.totalTokens;
        console.info(`Groq tokens input=${input ?? "?"} output=${output ?? "?"} total=${total ?? "?"}`);
      },
      onError({ error }) {
        console.error("Groq chat stream failed", error);
      },
      providerOptions: {
        groq: {
          reasoningEffort: "low",
          reasoningFormat: "hidden",
        },
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    const rateLimited = /rate limit|tokens per day|tokens per minute/i.test(raw);
    const message = rateLimited
      ? "The assistant is briefly unavailable. Try again in a few minutes."
      : error instanceof Error
        ? error.message
        : "The assistant could not reply.";
    return Response.json({ error: message }, { status: rateLimited ? 429 : 502 });
  }
}
