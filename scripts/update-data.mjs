import { getRuntimeConfig, loadChannels } from "./lib/config.mjs";
import { rootPath, writeJson, readJson, ensureDir } from "./lib/fs.mjs";
import { buildLandscape } from "./lib/relationships.mjs";
import { buildSeedDataset } from "./lib/seed.mjs";
import { summarizeVideo } from "./lib/summarize.mjs";
import { truncateText } from "./lib/text.mjs";
import { fetchVideoTranscript } from "./lib/transcript.mjs";
import { fetchLatestVideos } from "./lib/youtube.mjs";

function sortByPublishedDesc(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.publishedAt || 0).getTime();
    const rightTime = new Date(right.publishedAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function uniqueByVideoId(items) {
  const seen = new Set();
  const unique = [];

  for (const item of items) {
    if (!item.videoId || seen.has(item.videoId)) {
      continue;
    }

    seen.add(item.videoId);
    unique.push(item);
  }

  return unique;
}

function mergeNotes(...parts) {
  return [...new Set(parts.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].join(" | ");
}

function normalizeExistingRow(video) {
  return {
    ...video,
    summary: truncateText(video.summary || "", 320),
    transcriptSnippet: truncateText(video.transcriptSnippet || "", 320)
  };
}

function shouldReuseExisting(existing, runtimeConfig) {
  if (!existing || existing.processingStatus !== "ok") {
    return false;
  }

  const hasOversizedText =
    (existing.summary || "").length > 320 ||
    (existing.transcriptSnippet || "").length > 320;

  const canUpgradeToOpenAiSummary =
    Boolean(runtimeConfig.openAiApiKey) &&
    existing.transcriptStatus === "ok" &&
    existing.summarySource !== "openai-transcript";

  return !canUpgradeToOpenAiSummary && !hasOversizedText;
}

async function main() {
  await ensureDir(rootPath("data"));

  const runtimeConfig = getRuntimeConfig();
  const channels = await loadChannels();
  const previousVideos = await readJson(rootPath("data", "videos.json"), []);
  const previousById = new Map((Array.isArray(previousVideos) ? previousVideos : []).map((video) => [video.videoId, video]));
  const previousByChannel = new Map();

  for (const video of Array.isArray(previousVideos) ? previousVideos : []) {
    const bucket = previousByChannel.get(video.channelSlug) || [];
    bucket.push(video);
    previousByChannel.set(video.channelSlug, bucket);
  }

  const startedAt = new Date().toISOString();
  const liveRows = [];
  const notes = [];
  const errors = [];
  let openAiSummariesUsed = 0;

  for (const channel of channels) {
    try {
      const { feedUrl, videos } = await fetchLatestVideos(channel, {
        limit: runtimeConfig.youtubeFetchLimit
      });

      notes.push(`Fetched ${videos.length} videos for ${channel.name}.`);
      notes.push(`Resolved feed for ${channel.name}: ${feedUrl}`);

      for (const video of videos) {
        const existing = previousById.get(video.videoId);

        if (shouldReuseExisting(existing, runtimeConfig)) {
          liveRows.push(normalizeExistingRow(existing));
          continue;
        }

        const transcript = await fetchVideoTranscript(video.url);
        let summary;

        try {
          const shouldUseOpenAi =
            Boolean(runtimeConfig.openAiApiKey) &&
            transcript.status === "ok" &&
            openAiSummariesUsed < runtimeConfig.summaryMaxVideos;

          summary = await summarizeVideo(video, transcript, channel, {
            ...runtimeConfig,
            openAiApiKey: shouldUseOpenAi ? runtimeConfig.openAiApiKey : ""
          });

          if (summary.source === "openai-transcript") {
            openAiSummariesUsed += 1;
          }
        } catch (summaryError) {
          summary = await summarizeVideo(video, transcript, channel, {
            ...runtimeConfig,
            openAiApiKey: ""
          });

          errors.push(`Summary failed for ${video.title}: ${summaryError instanceof Error ? summaryError.message : String(summaryError)}`);
        }

        liveRows.push({
          id: video.videoId,
          videoId: video.videoId,
          channelSlug: channel.slug,
          channelName: channel.name,
          channelCategory: channel.category,
          title: video.title,
          url: video.url,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt,
          speaker: summary.speaker,
          guests: summary.guests,
          primaryTopics: summary.primaryTopics,
          secondaryTopics: summary.secondaryTopics,
          modelsMentioned: summary.modelsMentioned,
          summary: summary.summary,
          stance: summary.stance,
          transcriptSource: transcript.source,
          transcriptStatus: transcript.status,
          transcriptSnippet: summary.evidenceSnippet,
          summarySource: summary.source,
          processingStatus: transcript.status === "ok" ? "ok" : "partial",
          notes: mergeNotes(summary.notes, transcript.error)
        });
      }
    } catch (error) {
      errors.push(`Channel fetch failed for ${channel.name}: ${error instanceof Error ? error.message : String(error)}`);
      const previousRows = previousByChannel.get(channel.slug) || [];

      if (previousRows.length > 0) {
        notes.push(`Reused ${previousRows.length} cached videos for ${channel.name} after fetch failure.`);
        liveRows.push(...previousRows.map(normalizeExistingRow));
      }
    }
  }

  const realVideos = uniqueByVideoId(sortByPublishedDesc(liveRows));

  if (realVideos.length === 0) {
    const seed = buildSeedDataset();
    await writeJson(rootPath("data", "meta.json"), seed.meta);
    await writeJson(rootPath("data", "videos.json"), seed.videos);
    await writeJson(rootPath("data", "channels.json"), seed.channels);
    await writeJson(rootPath("data", "topics.json"), seed.topics);
    return;
  }

  const landscape = buildLandscape(realVideos, channels);
  const transcriptReadyCount = landscape.videos.filter((video) => video.transcriptStatus === "ok").length;
  const summaryReadyCount = landscape.videos.filter((video) => video.summary && video.summarySource !== "none").length;
  const generatedAt = new Date().toISOString();

  const meta = {
    mode: "live",
    startedAt,
    generatedAt,
    openAiEnabled: Boolean(runtimeConfig.openAiApiKey),
    trackedChannels: channels.length,
    processedVideos: landscape.videos.length,
    transcriptCoverage: landscape.videos.length > 0 ? transcriptReadyCount / landscape.videos.length : 0,
    summaryCoverage: landscape.videos.length > 0 ? summaryReadyCount / landscape.videos.length : 0,
    notes,
    errors,
    topicCount: landscape.topics.length
  };

  await writeJson(rootPath("data", "meta.json"), meta);
  await writeJson(rootPath("data", "videos.json"), landscape.videos);
  await writeJson(rootPath("data", "channels.json"), landscape.channels);
  await writeJson(rootPath("data", "topics.json"), landscape.topics);
}

main().catch(async (error) => {
  const seed = buildSeedDataset();
  seed.meta.errors = [
    ...(seed.meta.errors || []),
    `Pipeline crashed and fell back to fixture data: ${error instanceof Error ? error.message : String(error)}`
  ];

  await writeJson(rootPath("data", "meta.json"), seed.meta);
  await writeJson(rootPath("data", "videos.json"), seed.videos);
  await writeJson(rootPath("data", "channels.json"), seed.channels);
  await writeJson(rootPath("data", "topics.json"), seed.topics);
  process.exitCode = 1;
});
