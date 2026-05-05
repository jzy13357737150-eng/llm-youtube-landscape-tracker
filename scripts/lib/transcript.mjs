import {
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptNotAvailableLanguageError,
  YoutubeTranscriptTooManyRequestError,
  fetchTranscript
} from "youtube-transcript";
import { normalizeWhitespace } from "./text.mjs";

function mapTranscriptError(error) {
  if (error instanceof YoutubeTranscriptDisabledError) {
    return { status: "disabled", message: "Captions are disabled for this video." };
  }

  if (error instanceof YoutubeTranscriptNotAvailableLanguageError) {
    return { status: "language-miss", message: error.message };
  }

  if (error instanceof YoutubeTranscriptNotAvailableError) {
    return { status: "missing", message: "No transcript was available." };
  }

  if (error instanceof YoutubeTranscriptTooManyRequestError) {
    return { status: "rate-limited", message: "Transcript provider rate limited the request." };
  }

  return { status: "error", message: error instanceof Error ? error.message : String(error) };
}

function normalizeSegments(segments = []) {
  return segments.map((segment) => ({
    text: normalizeWhitespace(segment.text),
    duration: Number(segment.duration || 0),
    offset: Number(segment.offset || 0),
    lang: segment.lang || "unknown"
  }));
}

export async function fetchVideoTranscript(videoUrl) {
  try {
    const preferredEnglish = await fetchTranscript(videoUrl, { lang: "en" });
    const segments = normalizeSegments(preferredEnglish);
    const text = segments.map((item) => item.text).join(" ").trim();

    return {
      status: text ? "ok" : "missing",
      source: "youtube-captions",
      language: segments[0]?.lang || "en",
      segments,
      text,
      error: ""
    };
  } catch (englishError) {
    try {
      const anyLanguage = await fetchTranscript(videoUrl);
      const segments = normalizeSegments(anyLanguage);
      const text = segments.map((item) => item.text).join(" ").trim();

      return {
        status: text ? "ok" : "missing",
        source: "youtube-captions",
        language: segments[0]?.lang || "unknown",
        segments,
        text,
        error: ""
      };
    } catch (fallbackError) {
      const mapped = mapTranscriptError(fallbackError ?? englishError);

      return {
        status: mapped.status,
        source: "none",
        language: "",
        segments: [],
        text: "",
        error: mapped.message
      };
    }
  }
}
