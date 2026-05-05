function countItems(items = []) {
  const counts = new Map();

  for (const item of items.filter(Boolean)) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }

  return counts;
}

function topKeys(counts, limit = 5) {
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([key]) => key);
}

function channelTopicMap(videos) {
  const topicMap = new Map();

  for (const video of videos) {
    const current = topicMap.get(video.channelSlug) || [];
    current.push(...(video.primaryTopics || []), ...(video.secondaryTopics || []));
    topicMap.set(video.channelSlug, current);
  }

  return topicMap;
}

function computePeerScores(channelSlug, topics, topicMap) {
  const scores = [];

  for (const [peerSlug, peerTopics] of topicMap.entries()) {
    if (peerSlug === channelSlug) {
      continue;
    }

    const overlap = topics.filter((topic) => peerTopics.includes(topic));

    if (overlap.length > 0) {
      scores.push({
        slug: peerSlug,
        overlapCount: overlap.length,
        overlapTopics: [...new Set(overlap)].slice(0, 4)
      });
    }
  }

  return scores.sort((left, right) => right.overlapCount - left.overlapCount);
}

export function buildLandscape(videos, channels) {
  const byChannel = new Map(channels.map((channel) => [channel.slug, channel]));
  const topicMap = channelTopicMap(videos);

  const enrichedVideos = videos.map((video) => {
    const peers = computePeerScores(video.channelSlug, video.primaryTopics || [], topicMap).slice(0, 3);

    return {
      ...video,
      relatedChannels: peers.map((peer) => ({
        slug: peer.slug,
        name: byChannel.get(peer.slug)?.name || peer.slug,
        overlapTopics: peer.overlapTopics
      }))
    };
  });

  const channelCards = channels.map((channel) => {
    const channelVideos = enrichedVideos.filter((video) => video.channelSlug === channel.slug);
    const topics = channelVideos.flatMap((video) => [...(video.primaryTopics || []), ...(video.secondaryTopics || [])]);
    const stances = channelVideos.map((video) => video.stance);
    const topicCounts = countItems(topics);
    const stanceCounts = countItems(stances);
    const peers = computePeerScores(channel.slug, topKeys(topicCounts, 6), topicMap).slice(0, 3);

    return {
      slug: channel.slug,
      name: channel.name,
      url: channel.url,
      category: channel.category,
      focusAreas: channel.focusAreas || [],
      recentVideoCount: channelVideos.length,
      latestThemes: topKeys(topicCounts, 5),
      dominantFormats: topKeys(stanceCounts, 3),
      relatedChannels: peers.map((peer) => ({
        slug: peer.slug,
        name: byChannel.get(peer.slug)?.name || peer.slug,
        overlapTopics: peer.overlapTopics
      }))
    };
  });

  const allTopics = countItems(enrichedVideos.flatMap((video) => [...(video.primaryTopics || []), ...(video.secondaryTopics || [])]));
  const topicStats = topKeys(allTopics, 12).map((topic) => ({
    topic,
    count: allTopics.get(topic) || 0
  }));

  return {
    videos: enrichedVideos,
    channels: channelCards,
    topics: topicStats
  };
}
