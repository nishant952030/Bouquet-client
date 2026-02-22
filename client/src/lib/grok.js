const GROK_PROXY_URL = import.meta.env.VITE_GROK_PROXY_URL;
const GROK_API_URL = import.meta.env.VITE_GROK_API_URL || "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = import.meta.env.VITE_GROK_MODEL || "grok-2-latest";
const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY;

const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

function extractText(responseJson) {
  const content = responseJson?.choices?.[0]?.message?.content;
  if (!content) return "";
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join(" ")
      .trim();
  }
  return String(content).trim();
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
      temperature: 0.8,
      max_tokens: 160,
      messages: [
        {
          role: "system",
          content:
            "You write heartfelt short bouquet notes. Return only the final note. Keep it under 70 words, warm, human, and personal.",
        },
        {
          role: "user",
          content: `Write a bouquet note based on this situation:\n${situation.trim()}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed (${response.status}).`);
  }

  const data = await response.json();
  const note = extractText(data);
  if (!note) {
    throw new Error("AI did not return a note.");
  }
  return note;
}
