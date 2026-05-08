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

export function truncateText(value, maxLength = 320) {
  const text = normalizeWhitespace(value);

  if (text.length <= maxLength) {
    return text;
  }

  const clipped = text.slice(0, Math.max(0, maxLength - 3));
  const safeBoundary = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("? "),
    clipped.lastIndexOf(", "),
    clipped.lastIndexOf("; "),
    clipped.lastIndexOf(": "),
    clipped.lastIndexOf(" ")
  );

  const finalText = safeBoundary > 80 ? clipped.slice(0, safeBoundary) : clipped;
  return `${finalText.trim()}...`;
}

export function segmentExcerpt(segments = [], maxLength = 320, maxSegments = 8) {
  let built = "";

  for (const segment of segments.slice(0, maxSegments)) {
    const next = normalizeWhitespace(segment?.text || "");

    if (!next) {
      continue;
    }

    const candidate = built ? `${built} ${next}` : next;

    if (candidate.length > maxLength) {
      return truncateText(candidate, maxLength);
    }

    built = candidate;
  }

  return truncateText(built, maxLength);
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

export function fallbackSummary({ title, transcriptText, transcriptSegments = [], description, channelName }) {
  const transcriptSentences = splitSentences(transcriptText);
  const descriptionSentences = splitSentences(description);

  if (transcriptSentences.length >= 2) {
    return truncateText(transcriptSentences.slice(0, 2).join(" "), 320);
  }

  if (transcriptSentences.length === 1) {
    if (transcriptSentences[0].length > 320 && transcriptSegments.length > 0) {
      return segmentExcerpt(transcriptSegments, 320, 8);
    }

    return truncateText(transcriptSentences[0], 320);
  }

  if (transcriptSegments.length > 0) {
    return segmentExcerpt(transcriptSegments, 320, 8);
  }

  if (descriptionSentences.length > 0) {
    return truncateText(descriptionSentences.slice(0, 2).join(" "), 320);
  }

  return truncateText(`${channelName} discusses LLM-related themes in "${title}".`, 320);
}

export function pickEvidenceSnippet(transcriptText = "", transcriptSegments = []) {
  const sentences = splitSentences(transcriptText);

  if (sentences.length > 0) {
    return truncateText(sentences.slice(0, 2).join(" "), 320);
  }

  if (transcriptSegments.length > 0) {
    return segmentExcerpt(transcriptSegments, 320, 8);
  }

  return "";
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
