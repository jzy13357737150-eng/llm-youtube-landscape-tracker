export function buildSeedDataset() {
  const generatedAt = "2026-05-05T15:45:00.000Z";

  const videos = [
    {
      id: "seed-1",
      videoId: "seed-1",
      channelSlug: "andrej-karpathy",
      channelName: "Andrej Karpathy",
      channelCategory: "research",
      title: "How LLM inference tradeoffs change what builders should optimize",
      url: "https://www.youtube.com/@AndrejKarpathy",
      thumbnailUrl: "https://i.ytimg.com/vi/seed-1/hqdefault.jpg",
      publishedAt: "2026-04-28T12:00:00.000Z",
      speaker: "Andrej Karpathy",
      guests: [],
      primaryTopics: ["reasoning", "coding", "closed models"],
      secondaryTopics: ["agents", "evaluation"],
      modelsMentioned: ["gpt-5", "claude", "gemini"],
      summary: "Fixture preview: the speaker contrasts latency, cost, and product experience when deploying modern LLM systems, with emphasis on inference constraints rather than only benchmark scores.",
      stance: "analysis",
      transcriptSource: "fixture",
      transcriptStatus: "ok",
      summarySource: "fixture",
      transcriptSnippet: "Fixture snippet for UI preview showing that transcript-grounded evidence appears next to each row in production.",
      relatedChannels: [
        { "slug": "langchain", "name": "LangChain", "overlapTopics": ["agents", "evaluation"] },
        { "slug": "ibm-technology", "name": "IBM Technology", "overlapTopics": ["closed models"] }
      ],
      processingStatus: "fixture",
      notes: "Fixture data for local preview."
    },
    {
      id: "seed-2",
      videoId: "seed-2",
      channelSlug: "langchain",
      channelName: "LangChain",
      channelCategory: "developer-tools",
      title: "Building multi-agent LLM workflows with retrieval and eval loops",
      url: "https://www.youtube.com/@LangChain",
      thumbnailUrl: "https://i.ytimg.com/vi/seed-2/hqdefault.jpg",
      publishedAt: "2026-04-30T14:00:00.000Z",
      speaker: "LangChain",
      guests: [],
      primaryTopics: ["agents", "rag", "evaluation"],
      secondaryTopics: ["automation", "coding"],
      modelsMentioned: ["langchain", "claude", "gpt-5"],
      summary: "Fixture preview: this row represents a transcript-based walkthrough of agent orchestration, retrieval design, and the role of evaluation loops in keeping workflows reliable.",
      stance: "tutorial",
      transcriptSource: "fixture",
      transcriptStatus: "ok",
      summarySource: "fixture",
      transcriptSnippet: "Fixture transcript evidence would be replaced by a caption-backed snippet after the pipeline runs live.",
      relatedChannels: [
        { "slug": "the-ai-advantage", "name": "The AI Advantage", "overlapTopics": ["agents", "automation"] },
        { "slug": "andrej-karpathy", "name": "Andrej Karpathy", "overlapTopics": ["evaluation"] }
      ],
      processingStatus: "fixture",
      notes: "Fixture data for local preview."
    },
    {
      id: "seed-3",
      videoId: "seed-3",
      channelSlug: "assemblyai",
      channelName: "AssemblyAI",
      channelCategory: "developer-tools",
      title: "Shipping voice AI products with transcription, prompting, and guardrails",
      url: "https://www.youtube.com/@AssemblyAI",
      thumbnailUrl: "https://i.ytimg.com/vi/seed-3/hqdefault.jpg",
      publishedAt: "2026-04-27T09:00:00.000Z",
      speaker: "AssemblyAI",
      guests: [],
      primaryTopics: ["voice ai", "prompting", "enterprise ai"],
      secondaryTopics: ["coding", "automation"],
      modelsMentioned: ["openai", "claude"],
      summary: "Fixture preview: the creator frames voice interfaces as a production engineering problem, focusing on transcription quality, prompting reliability, and guardrails around real user conversations.",
      stance: "demo",
      transcriptSource: "fixture",
      transcriptStatus: "ok",
      summarySource: "fixture",
      transcriptSnippet: "Fixture snippet for voice AI content. Live runs would show a short evidence excerpt from captions.",
      relatedChannels: [
        { "slug": "ibm-technology", "name": "IBM Technology", "overlapTopics": ["enterprise ai"] }
      ],
      processingStatus: "fixture",
      notes: "Fixture data for local preview."
    },
    {
      id: "seed-4",
      videoId: "seed-4",
      channelSlug: "ibm-technology",
      channelName: "IBM Technology",
      channelCategory: "enterprise",
      title: "RAG, governance, and what enterprise teams actually need from LLM systems",
      url: "https://www.youtube.com/@IBMTechnology",
      thumbnailUrl: "https://i.ytimg.com/vi/seed-4/hqdefault.jpg",
      publishedAt: "2026-05-01T10:30:00.000Z",
      speaker: "IBM Technology",
      guests: [],
      primaryTopics: ["enterprise ai", "rag", "evaluation"],
      secondaryTopics: ["agents", "closed models"],
      modelsMentioned: ["watsonx", "gpt-5"],
      summary: "Fixture preview: this row highlights an enterprise view of LLM adoption, centering on governance, retrieval quality, and the difference between demos and production systems.",
      stance: "analysis",
      transcriptSource: "fixture",
      transcriptStatus: "ok",
      summarySource: "fixture",
      transcriptSnippet: "Fixture evidence snippet for enterprise governance and RAG discussion.",
      relatedChannels: [
        { "slug": "langchain", "name": "LangChain", "overlapTopics": ["rag", "evaluation"] },
        { "slug": "assemblyai", "name": "AssemblyAI", "overlapTopics": ["enterprise ai"] }
      ],
      processingStatus: "fixture",
      notes: "Fixture data for local preview."
    },
    {
      id: "seed-5",
      videoId: "seed-5",
      channelSlug: "matt-wolfe",
      channelName: "Matt Wolfe",
      channelCategory: "creator-news",
      title: "This week in AI: agent products, model launches, and workflow tools worth tracking",
      url: "https://www.youtube.com/@MattWolfe",
      thumbnailUrl: "https://i.ytimg.com/vi/seed-5/hqdefault.jpg",
      publishedAt: "2026-05-02T15:00:00.000Z",
      speaker: "Matt Wolfe",
      guests: [],
      primaryTopics: ["news", "agents", "automation"],
      secondaryTopics: ["closed models", "coding"],
      modelsMentioned: ["chatgpt", "claude", "gemini"],
      summary: "Fixture preview: a news-style roundup connecting product launches with practical automation use cases, useful for showing how the tracker captures creator commentary rather than only release headlines.",
      stance: "news",
      transcriptSource: "fixture",
      transcriptStatus: "ok",
      summarySource: "fixture",
      transcriptSnippet: "Fixture snippet for weekly AI news coverage.",
      relatedChannels: [
        { "slug": "the-ai-advantage", "name": "The AI Advantage", "overlapTopics": ["automation", "agents"] }
      ],
      processingStatus: "fixture",
      notes: "Fixture data for local preview."
    },
    {
      id: "seed-6",
      videoId: "seed-6",
      channelSlug: "the-ai-advantage",
      channelName: "The AI Advantage",
      channelCategory: "education",
      title: "Automating real work with LLM agents, no-code tools, and prompt systems",
      url: "https://www.youtube.com/@aiadvantage",
      thumbnailUrl: "https://i.ytimg.com/vi/seed-6/hqdefault.jpg",
      publishedAt: "2026-05-03T16:15:00.000Z",
      speaker: "The AI Advantage",
      guests: [],
      primaryTopics: ["automation", "agents", "prompting"],
      secondaryTopics: ["tutorial", "coding"],
      modelsMentioned: ["chatgpt", "claude", "n8n"],
      summary: "Fixture preview: the creator focuses on practical AI workflows, showing how prompting, tool selection, and automation design affect business outcomes.",
      stance: "tutorial",
      transcriptSource: "fixture",
      transcriptStatus: "ok",
      summarySource: "fixture",
      transcriptSnippet: "Fixture snippet illustrating transcript-grounded workflow advice.",
      relatedChannels: [
        { "slug": "langchain", "name": "LangChain", "overlapTopics": ["agents"] },
        { "slug": "matt-wolfe", "name": "Matt Wolfe", "overlapTopics": ["automation"] }
      ],
      processingStatus: "fixture",
      notes: "Fixture data for local preview."
    }
  ];

  const channels = [
    {
      slug: "andrej-karpathy",
      name: "Andrej Karpathy",
      url: "https://www.youtube.com/@AndrejKarpathy",
      category: "research",
      focusAreas: ["llm internals", "transformers", "training", "reasoning"],
      recentVideoCount: 1,
      latestThemes: ["reasoning", "coding", "evaluation"],
      dominantFormats: ["analysis"],
      relatedChannels: [
        { slug: "langchain", name: "LangChain", overlapTopics: ["agents", "evaluation"] }
      ]
    },
    {
      slug: "langchain",
      name: "LangChain",
      url: "https://www.youtube.com/@LangChain",
      category: "developer-tools",
      focusAreas: ["agents", "rag", "evaluation", "orchestration"],
      recentVideoCount: 1,
      latestThemes: ["agents", "rag", "evaluation"],
      dominantFormats: ["tutorial"],
      relatedChannels: [
        { slug: "the-ai-advantage", name: "The AI Advantage", overlapTopics: ["agents", "automation"] }
      ]
    },
    {
      slug: "assemblyai",
      name: "AssemblyAI",
      url: "https://www.youtube.com/@AssemblyAI",
      category: "developer-tools",
      focusAreas: ["voice ai", "llm apps", "speech", "production ai"],
      recentVideoCount: 1,
      latestThemes: ["voice ai", "enterprise ai", "prompting"],
      dominantFormats: ["demo"],
      relatedChannels: [
        { slug: "ibm-technology", name: "IBM Technology", overlapTopics: ["enterprise ai"] }
      ]
    },
    {
      slug: "ibm-technology",
      name: "IBM Technology",
      url: "https://www.youtube.com/@IBMTechnology",
      category: "enterprise",
      focusAreas: ["enterprise ai", "rag", "governance", "agentic ai"],
      recentVideoCount: 1,
      latestThemes: ["enterprise ai", "rag", "evaluation"],
      dominantFormats: ["analysis"],
      relatedChannels: [
        { slug: "langchain", name: "LangChain", overlapTopics: ["rag", "evaluation"] }
      ]
    },
    {
      slug: "matt-wolfe",
      name: "Matt Wolfe",
      url: "https://www.youtube.com/@MattWolfe",
      category: "creator-news",
      focusAreas: ["ai tools", "agent products", "industry news", "productivity"],
      recentVideoCount: 1,
      latestThemes: ["news", "agents", "automation"],
      dominantFormats: ["news"],
      relatedChannels: [
        { slug: "the-ai-advantage", name: "The AI Advantage", overlapTopics: ["automation"] }
      ]
    },
    {
      slug: "the-ai-advantage",
      name: "The AI Advantage",
      url: "https://www.youtube.com/@aiadvantage",
      category: "education",
      focusAreas: ["automation", "agents", "prompting", "workflows"],
      recentVideoCount: 1,
      latestThemes: ["automation", "agents", "prompting"],
      dominantFormats: ["tutorial"],
      relatedChannels: [
        { slug: "langchain", name: "LangChain", overlapTopics: ["agents"] }
      ]
    }
  ];

  const topics = [
    { topic: "agents", count: 4 },
    { topic: "automation", count: 3 },
    { topic: "evaluation", count: 3 },
    { topic: "rag", count: 2 },
    { topic: "enterprise ai", count: 2 },
    { topic: "prompting", count: 2 }
  ];

  const meta = {
    mode: "fixture",
    generatedAt,
    startedAt: generatedAt,
    openAiEnabled: false,
    trackedChannels: channels.length,
    processedVideos: videos.length,
    transcriptCoverage: 1,
    summaryCoverage: 1,
    notes: [
      "Using fixture dataset because no live API-backed run has been completed yet.",
      "The site, schema, and scheduler are production-ready; live deployments replace this snapshot with fresh transcript-grounded rows."
    ],
    errors: [],
    topicCount: topics.length
  };

  return { meta, videos, channels, topics };
}
