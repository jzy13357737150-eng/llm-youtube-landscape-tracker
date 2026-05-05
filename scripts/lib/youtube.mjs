import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
  parseTagValue: false
});

function decodeEscapedUrl(value = "") {
  return value.replace(/\\u0026/g, "&").replace(/\\\//g, "/");
}

function pickFirst(value) {
  return Array.isArray(value) ? value[0] : value;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; LLMYouTubeLandscapeTracker/1.0)"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }

  return response.text();
}

export async function resolveChannelFeedUrl(channel) {
  if (channel.feedUrl) {
    return channel.feedUrl;
  }

  const html = await fetchText(channel.url);
  const rssMatch = html.match(/"rssUrl":"(https:\\\/\\\/www\.youtube\.com\\\/feeds\\\/videos\.xml\?channel_id=[^"]+)"/);

  if (rssMatch?.[1]) {
    return decodeEscapedUrl(rssMatch[1]);
  }

  const idMatch = html.match(/"externalId":"(UC[a-zA-Z0-9_-]+)"/);

  if (idMatch?.[1]) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${idMatch[1]}`;
  }

  throw new Error(`Could not resolve feed URL for ${channel.name}`);
}

export async function fetchLatestVideos(channel, options = {}) {
  const limit = options.limit ?? 8;
  const feedUrl = await resolveChannelFeedUrl(channel);
  const xml = await fetchText(feedUrl);
  const feed = parser.parse(xml)?.feed;
  const entries = feed?.entry ? (Array.isArray(feed.entry) ? feed.entry : [feed.entry]) : [];

  const videos = entries.slice(0, limit).map((entry) => {
    const mediaGroup = entry["media:group"] || {};
    const linkNode = pickFirst(entry.link);
    const thumbNode = pickFirst(mediaGroup["media:thumbnail"]);
    const authorNode = pickFirst(entry.author);
    const videoId = entry["yt:videoId"] || "";
    const link = linkNode?.href || `https://www.youtube.com/watch?v=${videoId}`;

    return {
      videoId,
      channelSlug: channel.slug,
      channelName: channel.name,
      channelCategory: channel.category,
      title: entry.title || "",
      description: mediaGroup["media:description"] || "",
      publishedAt: entry.published || "",
      updatedAt: entry.updated || "",
      url: link,
      author: authorNode?.name || channel.name,
      thumbnailUrl: thumbNode?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
  });

  return {
    feedUrl,
    videos
  };
}
