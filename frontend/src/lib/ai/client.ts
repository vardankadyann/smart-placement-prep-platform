import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type AIProvider = "anthropic" | "openai";

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER as AIProvider;
  if (provider === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "anthropic";
}

export function hasAIKeys(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
}

let anthropic: Anthropic | null = null;
let openai: OpenAI | null = null;

function getAnthropic() {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T
): Promise<T> {
  if (!hasAIKeys()) return fallback;

  const provider = getAIProvider();

  try {
    if (provider === "anthropic") {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: `${systemPrompt}\n\nRespond ONLY with valid JSON. No markdown fences.`,
        messages: [{ role: "user", content: userPrompt }],
      });
      const text =
        response.content[0]?.type === "text" ? response.content[0].text : "";
      return JSON.parse(text) as T;
    }

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const text = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  fallback: string
): Promise<string> {
  if (!hasAIKeys()) return fallback;

  const provider = getAIProvider();

  try {
    if (provider === "anthropic") {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response.content[0]?.type === "text"
        ? response.content[0].text
        : fallback;
    }

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return response.choices[0]?.message?.content ?? fallback;
  } catch {
    return fallback;
  }
}

export async function* streamText(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): AsyncGenerator<string> {
  if (!hasAIKeys()) {
    yield "Configure ANTHROPIC_API_KEY or OPENAI_API_KEY to enable the AI Career Mentor.";
    return;
  }

  const provider = getAIProvider();

  try {
    if (provider === "anthropic") {
      const stream = await getAnthropic().messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      });
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
      return;
    }

    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  } catch (error) {
    yield `Error: ${error instanceof Error ? error.message : "AI request failed"}`;
  }
}
