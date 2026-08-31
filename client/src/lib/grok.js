const GROK_PROXY_URL = process.env.VITE_GROK_PROXY_URL;
const GROK_API_URL = process.env.VITE_GROK_API_URL || "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = process.env.VITE_GROK_MODEL || "grok-2-latest";
const GROK_API_KEY = process.env.VITE_GROK_API_KEY;

const GROQ_API_URL = process.env.VITE_GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || "gemma2-9b-it";
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;

function extractText(responseJson) {
  const msg = responseJson?.choices?.[0]?.message;
  // Some Groq reasoning models return empty content with reasoning in a separate field
  const content = msg?.content || msg?.reasoning || "";
  if (!content) return "";
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join(" ")
      .trim();
  }
  // Strip any <think>...</think> reasoning wrapper if present
  return String(content).replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

export async function generateNoteWithGrok({ situation }) {
  if (!situation?.trim()) {
    throw new Error("Please add your situation first.");
  }

  if (GROK_PROXY_URL) {
    const proxyResponse = await fetch(GROK_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation }),
    });
    if (!proxyResponse.ok) throw new Error("AI note generation failed.");
    const proxyData = await proxyResponse.json();
    const note = proxyData?.note?.trim();
    if (!note) throw new Error("AI did not return a note.");
    return note;
  }

  const provider = GROQ_API_KEY ? "groq" : "grok";
  const apiUrl = provider === "groq" ? GROQ_API_URL : GROK_API_URL;
  const apiKey = provider === "groq" ? GROQ_API_KEY : GROK_API_KEY;
  const model = provider === "groq" ? GROQ_MODEL : GROK_MODEL;

  if (!apiKey) {
    throw new Error("Missing API key. Add VITE_GROQ_API_KEY (or VITE_GROK_API_KEY) in .env.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.9,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content: `You write short, genuinely heartfelt notes that accompany digital flower bouquets.

Rules you must follow:
- Write in first person, from the sender to the recipient
- Keep it between 40–70 words — never longer
- Sound like a real human being wrote it, not an AI
- Be specific and warm — reference the situation naturally, don't restate it robotically  
- Never use: "may your day", "wishing you", "I hope this message finds you", "in this digital age", or any greeting-card clichés
- No hashtags, no emojis, no sign-offs like "Warmly" or "With love"
- Don't start with "I" — start with a different word or phrase
- Return ONLY the note text. No quotes, no explanation, no title.`,
        },
        {
          role: "user",
          content: `Write a bouquet note for this situation: ${situation.trim()}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `AI request failed (${response.status}).`);
  }

  const data = await response.json();
  const note = extractText(data);
  if (!note) {
    throw new Error("AI did not return a note.");
  }
  return note;
}
