import OpenAI from "openai";
import {
  detectModels,
  detectStance,
  detectTopics,
  extractGuestName,
  fallbackSummary,
  normalizeWhitespace,
  pickEvidenceSnippet
} from "./text.mjs";

function createClient(apiKey) {
  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}

function parseJsonObject(rawText) {
  const text = normalizeWhitespace(rawText);
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Model response did not contain JSON.");
  }

  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
}

function heuristicSummary(video, transcript, channel) {
  const primaryTopics = detectTopics(video.title, transcript.text, video.description, channel.focusAreas?.join(" "));
  const modelsMentioned = detectModels(video.title, transcript.text, video.description);
  const guest = extractGuestName(video.title);

  return {
    speaker: channel.name,
    guests: guest ? [guest] : [],
    primaryTopics,
    secondaryTopics: [],
    modelsMentioned,
    summary: fallbackSummary({
      title: video.title,
      transcriptText: transcript.text,
      description: video.description,
      channelName: channel.name
    }),
    stance: detectStance(video.title, transcript.text),
    evidenceSnippet: pickEvidenceSnippet(transcript.text),
    source: transcript.status === "ok" ? "heuristic-transcript" : "heuristic-metadata",
    notes: transcript.status === "ok" ? "" : transcript.error || "Transcript unavailable."
  };
}

export async function summarizeVideo(video, transcript, channel, runtimeConfig) {
  const fallback = heuristicSummary(video, transcript, channel);
  const client = createClient(runtimeConfig.openAiApiKey);

  if (!client || transcript.status !== "ok" || !transcript.text) {
    return fallback;
  }

  const transcriptExcerpt = transcript.text.slice(0, 12000);
  const response = await client.responses.create({
    model: runtimeConfig.openAiModel,
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text:
              "You extract structured, transcript-grounded metadata for YouTube videos about large language models. Return only valid JSON. Never invent claims that are not supported by the transcript."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              `Channel: ${channel.name}`,
              `Channel category: ${channel.category}`,
              `Video title: ${video.title}`,
              `Published at: ${video.publishedAt}`,
              `Known channel focus: ${(channel.focusAreas || []).join(", ")}`,
              "",
              "Produce JSON with this shape:",
              "{",
              '  "speaker": "string",',
              '  "guests": ["string"],',
              '  "primaryTopics": ["string"],',
              '  "secondaryTopics": ["string"],',
              '  "modelsMentioned": ["string"],',
              '  "summary": "2-3 concise sentences grounded in the transcript",',
              '  "stance": "tutorial|analysis|news|benchmark|demo|interview",',
              '  "evidenceSnippet": "a short non-sensitive paraphrased or directly-supported snippet from the transcript"',
              "}",
              "",
              "Transcript:",
              transcriptExcerpt
            ].join("\n")
          }
        ]
      }
    ]
  });

  const parsed = parseJsonObject(response.output_text || "");

  return {
    speaker: normalizeWhitespace(parsed.speaker || fallback.speaker),
    guests: Array.isArray(parsed.guests) ? parsed.guests.map((item) => normalizeWhitespace(item)).filter(Boolean) : fallback.guests,
    primaryTopics: Array.isArray(parsed.primaryTopics) && parsed.primaryTopics.length > 0
      ? parsed.primaryTopics.map((item) => normalizeWhitespace(item)).filter(Boolean).slice(0, 6)
      : fallback.primaryTopics,
    secondaryTopics: Array.isArray(parsed.secondaryTopics)
      ? parsed.secondaryTopics.map((item) => normalizeWhitespace(item)).filter(Boolean).slice(0, 6)
      : fallback.secondaryTopics,
    modelsMentioned: Array.isArray(parsed.modelsMentioned) && parsed.modelsMentioned.length > 0
      ? parsed.modelsMentioned.map((item) => normalizeWhitespace(item)).filter(Boolean).slice(0, 6)
      : fallback.modelsMentioned,
    summary: normalizeWhitespace(parsed.summary || fallback.summary),
    stance: normalizeWhitespace(parsed.stance || fallback.stance),
    evidenceSnippet: normalizeWhitespace(parsed.evidenceSnippet || fallback.evidenceSnippet),
    source: "openai-transcript",
    notes: ""
  };
}
