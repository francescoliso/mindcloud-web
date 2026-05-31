import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001";

export function weeklyReportPrompt(
  entries: { content: string; createdAt: Date }[],
  gratitude: { content: string }[],
): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const journalSection = entries.length
    ? entries.map((e) => `[${fmt(e.createdAt)}]\n${e.content}`).join("\n\n")
    : "No journal entries this week.";

  const gratitudeSection = gratitude.length
    ? gratitude.map((g) => `- ${g.content}`).join("\n")
    : "No gratitude entries this week.";

  return `You are a compassionate mental health journal assistant. Review the following week of journal entries and gratitude log, then write a warm, insightful weekly report (3–5 paragraphs). Highlight recurring themes, emotional patterns, moments of growth, and reinforce the gratitude items. Keep the tone supportive and encouraging.

## Journal Entries
${journalSection}

## Gratitude Log
${gratitudeSection}

Write the weekly report now:`;
}

export async function completeWeeklyReport(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
