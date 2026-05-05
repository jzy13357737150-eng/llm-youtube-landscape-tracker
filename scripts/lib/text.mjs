const TOPIC_RULES = [
  { topic: "agents", keywords: ["agent", "agents", "agentic"] },
  { topic: "rag", keywords: ["rag", "retrieval", "retrieval-augmented"] },
  { topic: "reasoning", keywords: ["reasoning", "chain of thought", "cot"] },
  { topic: "prompting", keywords: ["prompt", "prompting", "system prompt"] },
  { topic: "fine-tuning", keywords: ["fine-tuning", "finetuning", "sft", "rlhf"] },
  { topic: "evaluation", keywords: ["eval", "evaluation", "benchmark"] },
  { topic: "open-source models", keywords: ["llama", "mistral", "qwen", "deepseek", "open-source"] },
  { topic: "closed models", keywords: ["gpt-4", "gpt-5", "claude", "gemini"] },
  { topic: "voice ai", keywords: ["voice", "speech", "transcription", "audio"] },
  { topic: "coding", keywords: ["code", "coding", "copilot", "software engineer"] },
  { topic: "enterprise ai", keywords: ["enterprise", "governance", "compliance", "security"] },
  { topic: "automation", keywords: ["automation", "workflow", "zapier", "n8n"] },
  { topic: "tutorial", keywords: ["tutorial", "how to", "build", "step by step"] },
  { topic: "news", keywords: ["news", "announced", "release", "launch"] }
];

const MODEL_RULES = [
  "gpt-4",
  "gpt-5",
  "chatgpt",
  "claude",
  "gemini",
  "llama",
  "qwen",
  "deepseek",
  "mistral",
  "perplexity",
  "langchain",
  "openai",
  "anthropic"
];

export function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function toSlug(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function splitSentences(value) {
  return normalizeWhitespace(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function detectTopics(...parts) {
  const text = normalizeWhitespace(parts.filter(Boolean).join(" ")).toLowerCase();
  const topics = TOPIC_RULES
    .filter((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
    .map((rule) => rule.topic);

  return [...new Set(topics)].slice(0, 6);
}

export function detectModels(...parts) {
  const text = normalizeWhitespace(parts.filter(Boolean).join(" ")).toLowerCase();
  const models = MODEL_RULES.filter((item) => text.includes(item.toLowerCase()));
  return [...new Set(models)].slice(0, 6);
}

export function detectStance(title = "", transcript = "") {
  const text = `${title} ${transcript}`.toLowerCase();

  if (/\binterview\b|\bpodcast\b|\bconversation\b/.test(text)) return "interview";
  if (/\bbuild\b|\btutorial\b|\bhow to\b|\bstep by step\b/.test(text)) return "tutorial";
  if (/\bnews\b|\bannounced\b|\brelease\b|\blaunch\b/.test(text)) return "news";
  if (/\bbenchmark\b|\beval\b|\bcomparison\b/.test(text)) return "benchmark";
  if (/\bdemo\b|\bshowcase\b|\bworkflow\b/.test(text)) return "demo";

  return "analysis";
}

export function fallbackSummary({ title, transcriptText, description, channelName }) {
  const transcriptSentences = splitSentences(transcriptText);
  const descriptionSentences = splitSentences(description);

  if (transcriptSentences.length >= 2) {
    return transcriptSentences.slice(0, 2).join(" ");
  }

  if (transcriptSentences.length === 1) {
    return transcriptSentences[0];
  }

  if (descriptionSentences.length > 0) {
    return descriptionSentences.slice(0, 2).join(" ");
  }

  return `${channelName} discusses LLM-related themes in "${title}".`;
}

export function pickEvidenceSnippet(transcriptText = "") {
  const sentences = splitSentences(transcriptText);
  return sentences.slice(0, 2).join(" ").slice(0, 320);
}

export function extractGuestName(title = "") {
  const patterns = [
    /\bwith ([A-Z][A-Za-z0-9.'-]+(?: [A-Z][A-Za-z0-9.'-]+){0,3})/,
    /\bfeat\.? ([A-Z][A-Za-z0-9.'-]+(?: [A-Z][A-Za-z0-9.'-]+){0,3})/,
    /\bfeaturing ([A-Z][A-Za-z0-9.'-]+(?: [A-Z][A-Za-z0-9.'-]+){0,3})/
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);

    if (match) {
      return match[1].trim();
    }
  }

  return "";
}
