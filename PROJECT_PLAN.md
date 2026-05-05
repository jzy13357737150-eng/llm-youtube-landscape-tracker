# LLM YouTube Landscape Tracker - Project Plan

## 1. Problem Restatement

Build a public, continuously updated web page that tracks popular YouTube creators discussing LLMs.

The page should:

- monitor selected YouTube channels automatically
- ingest new videos as they appear
- use transcripts or reliable captions to understand the actual content
- summarize each video into structured fields
- show a concise table of:
  - who is speaking
  - what LLM topics are covered
  - how the channel relates to others on LLM themes
- remain online so reviewers can inspect the live result

The final submission also needs:

- a public GitHub repository
- a markdown report covering:
  - Problem Statement
  - Methodology
  - Evaluation Dataset
  - Evaluation Methods
  - Experimental Results

## 2. Hidden Evaluation Criteria

Besides the written prompt, reviewers are likely checking:

- whether the pipeline is real and automated rather than manually curated
- whether summaries are grounded in transcript text, not only titles
- whether the site is easy to demo live
- whether the update mechanism is production-minded
- whether tradeoffs are explained clearly
- whether the repo is clean enough for another engineer to run

## 3. Concrete Deliverables

### Must-have

1. Public website with a table of tracked videos
2. Automated collection pipeline for YouTube videos
3. Transcript ingestion using captions and/or ASR
4. LLM-based structuring and summarization
5. Persistent storage for video metadata and processed output
6. Scheduled updates so new videos appear automatically
7. Public GitHub repo
8. Markdown report

### Strongly recommended

1. Per-video detail page with transcript excerpt evidence
2. Clear freshness markers such as `last updated` and processing status
3. Channel/topic filters
4. Logs or admin page showing pipeline steps
5. Caching and idempotent processing

## 4. Recommended Scope for an Internship Exercise

Keep the first version narrow and credible:

- track 8-15 channels
- process the latest 5-20 videos per channel initially
- then only fetch new uploads on schedule
- support English first
- prefer captions first; fall back to ASR only when needed

This is enough to show product thinking without overbuilding.

## 5. Suggested Channel Set

Choose channels that frequently discuss LLMs from different angles:

- research / analysis
- developer tooling
- product / startup
- AI news commentary
- education / tutorials

Possible examples to evaluate:

- Andrej Karpathy
- Two Minute Papers
- The AI Advantage
- Matt Wolfe
- All About AI
- Latent Space podcast clips if usable
- Y Combinator AI-related content
- a16z AI-related content

Final channel choice should balance popularity, frequency, and transcript availability.

## 6. Recommended Architecture

## Option A: Practical interview-friendly stack

- frontend: Next.js
- hosting: Vercel
- database: Supabase Postgres
- scheduled jobs: GitHub Actions or Vercel Cron
- video/channel ingestion: YouTube Data API
- transcript layer:
  - first choice: YouTube captions
  - fallback: Whisper or a reliable transcript provider
- structuring/summarization: OpenAI or another strong LLM

Why this option is strong:

- easy to host publicly
- simple live demo
- readable full-stack codebase
- straightforward scheduled updates
- cheap enough for a take-home exercise

## Option B: OpenClaw-first

Use OpenClaw only if:

- you can explain clearly why it helps
- it genuinely reduces manual engineering
- you can still show reliable scheduling, persistence, and public hosting

If OpenClaw adds setup complexity without a clear upside, an equivalent watcher is safer. The prompt explicitly allows that.

## 7. Data Pipeline Workflow

### Step 1: Channel registry

Maintain a source of truth for tracked channels:

- channel name
- channel ID
- channel URL
- category
- priority
- language

### Step 2: Fetch latest uploads

On a schedule:

- pull newest videos for each tracked channel
- upsert metadata into the database
- skip already processed videos unless metadata changed

### Step 3: Acquire transcript

For each new video:

- try official captions first
- if captions are unavailable, mark as pending fallback ASR
- if fallback ASR is enabled, transcribe audio and store transcript

Store:

- transcript source
- transcript text
- transcript confidence / quality note
- transcript retrieval time

### Step 4: LLM extraction

Prompt the model to output structured fields such as:

- speaker / host
- guests if any
- primary LLM topics
- secondary topics
- claims / viewpoints
- tools / models mentioned
- summary grounded in transcript
- stance tags such as tutorial, opinion, news, benchmark, product demo

### Step 5: Cross-channel relation layer

Generate relationship features:

- overlapping topic tags
- shared models/tools mentioned
- similar recent themes
- channel category

This does not need to be a full graph product in v1.
It can be a computed field like:

- `Related channels on this topic: Karpathy, Matt Wolfe`

### Step 6: Publish to site

Render:

- video table
- filters by channel/topic/date
- row-level summaries
- evidence link to transcript or transcript snippet
- detail page if time allows

### Step 7: Keep it current

Use a scheduler to:

- fetch new uploads every few hours
- process only new or failed items
- update `last updated` timestamp on the site

## 8. Proposed Database Entities

Minimum schema:

- `channels`
- `videos`
- `transcripts`
- `video_summaries`
- `video_topics`
- `pipeline_runs`

Helpful fields:

- processing status
- error message
- transcript source
- summary model version
- published_at
- fetched_at
- last_processed_at

## 9. What the Table Should Show

Recommended columns:

- video title
- channel
- speaker
- published date
- primary topics
- short summary
- LLM models/tools mentioned
- relationship to other channels
- transcript source
- watch link

Optional but impressive:

- confidence / evidence badge
- sentiment or stance
- novelty score

## 10. What “Who Is Speaking” Should Mean

Reviewers may test this point.

Define it explicitly in the report:

- default: channel owner / primary narrator
- if an interview or podcast: host + guest
- if ambiguous: use channel owner and note ambiguity

Avoid pretending diarization is perfect unless you truly implement it.

## 11. Evaluation Strategy

Even if the prompt says “if applicable”, include evaluation.

### Lightweight evaluation plan

Sample 20-30 processed videos and manually judge:

- transcript adequacy
- topic classification accuracy
- summary faithfulness
- speaker identification correctness
- cross-channel relation usefulness

### Suggested metrics

- caption/transcript coverage rate
- processing success rate
- summary faithfulness pass rate
- topic-tag precision on annotated sample
- median end-to-end processing time

## 12. Interview-Ready Tradeoffs

Be ready to explain:

### Why captions-first?

- cheaper
- faster
- usually sufficient for YouTube content
- fallback ASR only when necessary

### Why not full speaker diarization?

- overkill for v1
- many channels are single-speaker
- interviews can be handled with metadata + transcript cues

### Why structured extraction instead of only free-form summaries?

- easier to filter and query
- better for a table product
- more auditable

### Why this hosting approach?

- simple public access
- cheap
- fast iteration
- easy for reviewers to validate

## 13. Risks and Mitigations

### Risk: transcript availability is inconsistent

Mitigation:

- store transcript source
- fall back to ASR
- expose status when transcript is missing

### Risk: YouTube API quotas

Mitigation:

- limit tracked channels
- use incremental fetching
- cache aggressively

### Risk: LLM summaries hallucinate

Mitigation:

- summarize from transcript chunks
- require structured JSON output
- store supporting transcript snippets

### Risk: scheduled jobs fail silently

Mitigation:

- log each pipeline run
- show processing status
- alert via GitHub Actions logs or simple failure notifications

## 14. Best Demo Flow for the Interview

Prepare to demo in this order:

1. Open the public site
2. Show the table and filters
3. Open one row and show transcript-grounded summary
4. Show where transcript came from
5. Explain scheduler and update flow
6. Open GitHub repo and architecture diagram
7. Show one pipeline run or logs

This order helps reviewers see the product first and infrastructure second.

## 15. What You Should Know Before the Interview

You should be able to explain:

1. Why you selected those channels
2. How new videos are discovered
3. How transcripts are obtained
4. How summaries stay faithful to actual spoken content
5. How topic tags are defined
6. How channels are related on LLM themes
7. How the scheduler works
8. What happens when transcript or summarization fails
9. What parts are deterministic vs LLM-based
10. What you would improve in v2

## 16. Suggested v1 Implementation Order

1. Define scope and tracked channels
2. Set up repo and environment
3. Build database schema
4. Implement channel/video ingestion
5. Implement transcript ingestion
6. Implement LLM extraction pipeline
7. Build public table UI
8. Add scheduled updates
9. Add logs/status fields
10. Write markdown report

## 17. Recommendation

For this exercise, the strongest path is:

- do not optimize for the most exotic architecture
- optimize for a convincing live demo
- use a simple automated pipeline with clear storage and scheduling
- make transcript grounding visible
- keep the site public and obviously fresh

If we proceed, the next best step is to scaffold:

- product spec
- system architecture
- initial schema
- channel shortlist
- repo structure
