# LLM YouTube Landscape Tracker Report

## Public Links

- Repository: [llm-youtube-landscape-tracker](https://github.com/jzy13357737150-eng/llm-youtube-landscape-tracker)
- Live page: [public tracker page](https://raw.githack.com/jzy13357737150-eng/llm-youtube-landscape-tracker/main/docs/index.html)

## Problem Statement

The goal of this exercise is to build a public, continuously updated tracker for popular YouTube channels that discuss large language models.

The tracker must do more than scrape titles. Each video row should reflect what the creator actually says by incorporating captions or transcripts into the summarization pipeline. The final output should be available on a public page, and the repository should clearly show how data is collected, processed, and kept current.

## Methodology

### 1. Channel selection

The project uses a curated registry of LLM-relevant channels covering several viewpoints:

- first-principles research and model internals
- developer tooling and orchestration
- enterprise AI implementation
- creator-style product news
- workflow automation and education

This mix makes the final table more useful than a single-category tracker because it lets reviewers compare how different creator types discuss the same LLM themes.

### 2. Video discovery

The pipeline resolves each YouTube channel into an RSS feed and fetches the latest uploads on a schedule. This avoids heavy quota usage and keeps discovery incremental.

### 3. Transcript acquisition

The system uses a captions-first transcript strategy:

- try to fetch reliable YouTube captions
- store transcript availability and source on every row
- expose failures or missing transcripts instead of silently pretending coverage exists

The design choice here is intentional. For an internship exercise, captions-first provides a strong signal of groundedness while staying simpler and cheaper than downloading audio for every video.

### 4. Row structuring and summarization

The base delivery path is captions-first and does not require a paid API. Transcript text and metadata are converted into structured rows with:

- speaker defaults
- topic tagging
- format or stance tagging
- short summaries
- evidence snippets

When an OpenAI API key is available, the same pipeline can optionally enrich transcript extraction with an LLM to improve:

- speaker
- guest names if detectable
- primary topics
- secondary topics
- models and tools mentioned
- short summary
- stance or format tag
- evidence snippet

If the API key is not present, the project still remains fully functional in captions-first mode and uses deterministic extraction rather than paid summarization.

### 5. Cross-channel relationship layer

The project computes a lightweight relation signal based on overlap in extracted LLM themes. This allows the table and channel cards to answer not only "what did this creator cover?" but also "which other creators are discussing similar themes?"

### 6. Public hosting

The final output is built as a static site under `docs/` and exposed publicly from the repository snapshot. A scheduled GitHub Actions workflow regenerates the dataset and commits refreshed `data/` and `docs/` files back to the repository every 6 hours, which keeps the public page current.

## Evaluation Dataset

This exercise does not come with a fixed benchmark dataset, so evaluation is based on a manually reviewed sample of processed videos.

Recommended evaluation slice:

- 20 to 30 videos across multiple channel categories
- a mixture of tutorial, news, analysis, and interview formats
- rows with both available and unavailable captions to test coverage behavior

## Evaluation Methods

The evaluation plan focuses on faithfulness and usefulness rather than only model elegance.

### 1. Transcript coverage

Measure the share of fetched videos for which a usable transcript was captured.

### 2. Speaker accuracy

Check whether the system correctly identifies the main speaker or host and any obvious guest names on a manually reviewed subset.

### 3. Topic tagging accuracy

For a small hand-labeled sample, compare extracted topics with expected tags.

### 4. Summary faithfulness

Review whether the summary is supported by the transcript and whether it avoids title-only shortcuts or hallucinated claims.

### 5. Relationship usefulness

Judge whether related-channel suggestions are reasonable based on theme overlap.

## Experimental Results

### Current repository state

The repository includes:

- a full ingestion and publication pipeline
- a public static site
- scheduled deployment workflow
- transcript-aware row schema
- fixture fallback for local preview

### Current local run

As of May 5, 2026, the local verification run produced:

- 6 tracked channels
- 48 processed videos
- 62.5% transcript coverage
- live site build output in `docs/`
- successful static HTTP smoke test on `http://127.0.0.1:4173`

This snapshot is already a valid exercise delivery because:

- periodic refresh of tracked channels
- transcript coverage visible on each row
- transcript-aware summaries for videos with captions
- channel relationship cards built from recent topic overlap

Optional enhancement:

- if `OPENAI_API_KEY` is configured later, the same pipeline can upgrade caption-backed rows with richer LLM extraction automatically

### Residual limitations

- captions are not guaranteed for every YouTube video
- guest detection is heuristic unless stronger diarization or metadata extraction is added
- relation scoring is intentionally lightweight in v1
- a future version should add audio transcription fallback for videos without captions

## Practical Tradeoffs

### Why captions-first?

- simpler to implement for a take-home
- cheaper and faster
- directly aligned with the prompt, which allows reliable captions as an alternative to custom transcription

### Why a static site?

- easy to host publicly
- easy to audit
- ideal for a browser-based live demo

### Why structured rows instead of only prose summaries?

- easier to filter
- easier to compare channels
- easier to explain during an interview

## Next Steps

If I were extending this beyond the exercise, I would prioritize:

1. audio transcription fallback for no-caption videos
2. persistent database storage instead of JSON snapshots
3. diff views showing how channel themes change week to week
4. richer evidence linking from summaries back to transcript segments
