import dotenv from "dotenv";
import { rootPath, readJson } from "./fs.mjs";

dotenv.config({ path: rootPath(".env") });

function asInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getRuntimeConfig() {
  return {
    openAiApiKey: process.env.OPENAI_API_KEY || "",
    openAiModel: process.env.OPENAI_MODEL || "gpt-5",
    youtubeFetchLimit: asInt(process.env.YOUTUBE_FETCH_LIMIT, 8),
    summaryMaxVideos: asInt(process.env.SUMMARY_MAX_VIDEOS, 30),
    siteBaseUrl: process.env.SITE_BASE_URL || "",
  };
}

export async function loadChannels() {
  const channels = await readJson(rootPath("config", "channels.json"), []);
  return Array.isArray(channels) ? channels : [];
}
