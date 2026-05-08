const refs = {
  modeBadge: document.querySelector("#mode-badge"),
  lastUpdated: document.querySelector("#last-updated"),
  processingMode: document.querySelector("#processing-mode"),
  statChannels: document.querySelector("#stat-channels"),
  statVideos: document.querySelector("#stat-videos"),
  statTranscripts: document.querySelector("#stat-transcripts"),
  statTopTopic: document.querySelector("#stat-top-topic"),
  channelFilter: document.querySelector("#channel-filter"),
  topicFilter: document.querySelector("#topic-filter"),
  stanceFilter: document.querySelector("#stance-filter"),
  searchInput: document.querySelector("#search-input"),
  videosBody: document.querySelector("#videos-body"),
  channelGrid: document.querySelector("#channel-grid"),
  topicCloud: document.querySelector("#topic-cloud"),
  detailDialog: document.querySelector("#detail-dialog"),
  detailClose: document.querySelector("#detail-close"),
  detailContent: document.querySelector("#detail-content")
};

const state = {
  meta: null,
  videos: [],
  channels: [],
  topics: [],
  filters: {
    channel: "",
    topic: "",
    stance: "",
    search: ""
  }
};

function formatDate(value) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function topicPills(items = []) {
  if (!items.length) {
    return `<span class="chip">No topics yet</span>`;
  }

  return items.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("");
}

function peerPills(items = []) {
  if (!items.length) {
    return `<span class="row-subtitle">No overlap detected yet</span>`;
  }

  return items
    .map(
      (item) =>
        `<span class="topic-pill">${escapeHtml(item.name)}<small>${escapeHtml(
          (item.overlapTopics || []).join(", ")
        )}</small></span>`
    )
    .join("");
}

function matchesFilters(video) {
  const searchTarget = [
    video.title,
    video.channelName,
    video.speaker,
    video.summary,
    ...(video.primaryTopics || []),
    ...(video.secondaryTopics || []),
    ...(video.modelsMentioned || [])
  ]
    .join(" ")
    .toLowerCase();

  const { channel, topic, stance, search } = state.filters;

  if (channel && video.channelSlug !== channel) return false;
  if (topic && ![...(video.primaryTopics || []), ...(video.secondaryTopics || [])].includes(topic)) return false;
  if (stance && video.stance !== stance) return false;
  if (search && !searchTarget.includes(search.toLowerCase())) return false;

  return true;
}

function renderMeta() {
  const { meta, topics, videos, channels } = state;

  refs.modeBadge.textContent = meta.mode === "live" ? "Live pipeline" : "Fixture preview";
  refs.modeBadge.classList.toggle("fixture", meta.mode !== "live");
  refs.lastUpdated.textContent = `Last updated ${formatDate(meta.generatedAt)} - ${meta.processedVideos} videos`;
  refs.processingMode.textContent = meta.openAiEnabled
    ? "Optional LLM enrichment is enabled for this snapshot."
    : "This snapshot is running in the default captions-first mode, without optional paid LLM enrichment.";
  refs.statChannels.textContent = String(channels.length);
  refs.statVideos.textContent = String(videos.length);
  refs.statTranscripts.textContent = formatPercent(meta.transcriptCoverage);
  refs.statTopTopic.textContent = topics[0]?.topic || "None";
}

function renderFilterOptions() {
  const channelOptions = state.channels
    .map((channel) => `<option value="${escapeHtml(channel.slug)}">${escapeHtml(channel.name)}</option>`)
    .join("");

  const topicOptions = state.topics
    .map((topic) => `<option value="${escapeHtml(topic.topic)}">${escapeHtml(topic.topic)}</option>`)
    .join("");

  const stances = [...new Set(state.videos.map((video) => video.stance).filter(Boolean))].sort();
  const stanceOptions = stances
    .map((stance) => `<option value="${escapeHtml(stance)}">${escapeHtml(stance)}</option>`)
    .join("");

  refs.channelFilter.innerHTML = `<option value="">All channels</option>${channelOptions}`;
  refs.topicFilter.innerHTML = `<option value="">All topics</option>${topicOptions}`;
  refs.stanceFilter.innerHTML = `<option value="">All formats</option>${stanceOptions}`;
}

function renderRows() {
  const visibleVideos = state.videos.filter(matchesFilters);

  if (!visibleVideos.length) {
    refs.videosBody.innerHTML = `<tr><td colspan="7" class="empty-state">No rows match the current filters.</td></tr>`;
    return;
  }

  refs.videosBody.innerHTML = visibleVideos
    .map(
      (video) => `
        <tr data-video-id="${escapeHtml(video.videoId)}">
          <td>
            <div class="row-subtitle">${escapeHtml(formatDate(video.publishedAt))}</div>
            <div class="row-subtitle">${escapeHtml(video.stance || "analysis")}</div>
          </td>
          <td>
            <div class="row-title">${escapeHtml(video.channelName)}</div>
            <div class="row-subtitle">${escapeHtml(video.channelCategory || "")}</div>
          </td>
          <td>
            <div class="row-title">${escapeHtml(video.speaker || video.channelName)}</div>
            <div class="row-subtitle">${escapeHtml((video.guests || []).join(", ") || "No guest detected")}</div>
          </td>
          <td><div class="topic-list">${topicPills(video.primaryTopics || [])}</div></td>
          <td>
            <button class="row-button" type="button" data-open-details="${escapeHtml(video.videoId)}">
              <div class="row-title">${escapeHtml(video.title)}</div>
              <div class="summary-copy">${escapeHtml(video.summary || "Summary unavailable")}</div>
            </button>
          </td>
          <td><div class="peer-list">${peerPills(video.relatedChannels || [])}</div></td>
          <td>
            <div class="row-subtitle">${escapeHtml(video.transcriptSource || "none")}</div>
            <div class="row-subtitle">${escapeHtml(video.transcriptStatus || "unknown")}</div>
          </td>
        </tr>
      `
    )
    .join("");

  refs.videosBody.querySelectorAll("[data-open-details]").forEach((button) => {
    button.addEventListener("click", () => openDetails(button.dataset.openDetails));
  });
}

function renderChannels() {
  refs.channelGrid.innerHTML = state.channels
    .map(
      (channel) => `
        <article class="channel-card">
          <h3>${escapeHtml(channel.name)}</h3>
          <p class="channel-meta">${escapeHtml(channel.category)} - ${channel.recentVideoCount} recent videos</p>
          <div class="detail-section">
            <h3>Latest themes</h3>
            <div class="topic-list">${topicPills(channel.latestThemes || [])}</div>
          </div>
          <div class="detail-section">
            <h3>Most related peers</h3>
            <div class="peer-list">${peerPills(channel.relatedChannels || [])}</div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTopics() {
  refs.topicCloud.innerHTML = state.topics
    .map((topic) => `<span class="topic-pill">${escapeHtml(topic.topic)} - ${topic.count}</span>`)
    .join("");
}

function openDetails(videoId) {
  const video = state.videos.find((item) => item.videoId === videoId);

  if (!video) return;

  refs.detailContent.innerHTML = `
    <p class="eyebrow">Video Detail</p>
    <h2>${escapeHtml(video.title)}</h2>
    <p class="detail-meta">
      ${escapeHtml(video.channelName)} - ${escapeHtml(formatDate(video.publishedAt))} - ${escapeHtml(
        video.summarySource || "unknown"
      )}
    </p>

    <div class="detail-section">
      <h3>Summary</h3>
      <p>${escapeHtml(video.summary || "Summary unavailable")}</p>
    </div>

    <div class="detail-section">
      <h3>Evidence snippet</h3>
      <p>${escapeHtml(video.transcriptSnippet || "No evidence snippet stored yet.")}</p>
    </div>

    <div class="detail-section">
      <h3>Topics and models</h3>
      <div class="topic-list">
        ${topicPills([...(video.primaryTopics || []), ...(video.secondaryTopics || []), ...(video.modelsMentioned || [])])}
      </div>
    </div>

    <div class="detail-section">
      <h3>Processing notes</h3>
      <p>${escapeHtml(video.notes || "No additional notes.")}</p>
    </div>

    <div class="detail-section">
      <h3>Open source</h3>
      <p><a href="${escapeHtml(video.url)}" target="_blank" rel="noreferrer">Watch on YouTube</a></p>
    </div>
  `;

  refs.detailDialog.showModal();
}

function attachEvents() {
  refs.channelFilter.addEventListener("change", (event) => {
    state.filters.channel = event.target.value;
    renderRows();
  });

  refs.topicFilter.addEventListener("change", (event) => {
    state.filters.topic = event.target.value;
    renderRows();
  });

  refs.stanceFilter.addEventListener("change", (event) => {
    state.filters.stance = event.target.value;
    renderRows();
  });

  refs.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim();
    renderRows();
  });

  refs.detailClose.addEventListener("click", () => refs.detailDialog.close());
  refs.detailDialog.addEventListener("click", (event) => {
    if (event.target === refs.detailDialog) {
      refs.detailDialog.close();
    }
  });
}

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json();
}

async function main() {
  const [meta, videos, channels, topics] = await Promise.all([
    loadJson("./data/meta.json"),
    loadJson("./data/videos.json"),
    loadJson("./data/channels.json"),
    loadJson("./data/topics.json")
  ]);

  state.meta = meta;
  state.videos = videos;
  state.channels = channels;
  state.topics = topics;

  renderMeta();
  renderFilterOptions();
  renderRows();
  renderChannels();
  renderTopics();
  attachEvents();
}

main().catch((error) => {
  refs.videosBody.innerHTML = `<tr><td colspan="7" class="empty-state">${escapeHtml(
    error instanceof Error ? error.message : String(error)
  )}</td></tr>`;
});
