# LLM YouTube Landscape Tracker

This repository contains a public, browser-friendly tracker for YouTube creators who discuss large language models.

Live site:

- [Public tracker page](https://raw.githack.com/jzy13357737150-eng/llm-youtube-landscape-tracker/main/docs/index.html)
- [Repository report](https://github.com/jzy13357737150-eng/llm-youtube-landscape-tracker/blob/main/report/REPORT.md)

The project is designed for a recruitment exercise and focuses on three things:

- collecting recent videos from a curated set of LLM channels
- grounding summaries in captions or transcripts instead of only titles
- publishing the output as a public page that can stay fresh on a schedule

## What is included

- `site/`: static public site source
- `scripts/`: ingestion, transcript, summarization, and build pipeline
- `config/channels.json`: tracked channel registry
- `data/`: generated site data
- `docs/`: published static output for the public browser page
- `report/REPORT.md`: submission report in markdown

## Architecture

1. Channel feeds are monitored with YouTube RSS feeds resolved from each channel page.
2. New videos are fetched into a normalized JSON dataset.
3. Captions are pulled through a transcript fetcher.
4. Transcript text is converted into structured rows through a captions-first extraction pipeline.
5. Optional LLM enrichment can improve summaries when `OPENAI_API_KEY` is configured.
6. Relationship signals are computed from shared topic tags across channels.
7. A static site is built into `docs/` and served publicly from the repository snapshot.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Generate data and build the public site:

```bash
npm run build
```

3. Preview the site locally:

```bash
npm run preview
```

Then open `http://localhost:4173`.

Optional:

- copy `.env.example` to `.env` only if you want to try optional LLM enrichment
- the default delivery path does not require any paid API

## Environment variables

- `OPENAI_API_KEY`: optional enhancement for richer transcript-grounded summaries
- `OPENAI_MODEL`: defaults to `gpt-5`
- `YOUTUBE_FETCH_LIMIT`: latest videos per channel to scan each run
- `SUMMARY_MAX_VIDEOS`: cap on transcript summaries per run
- `SITE_BASE_URL`: optional metadata for public deployment

## Secret handling

Do not commit API keys into the repository, report, generated data, or GitHub issue text.

Safe locations:

- local `.env` file for development
- GitHub Actions repository secret named `OPENAI_API_KEY` for scheduled deployments

Unsafe locations:

- `README.md`
- `REPORT.md`
- `config/`
- `data/`
- `docs/`
- committed workflow YAML values

This repository ignores local environment files by default so secrets stay out of version control.

## Notes on transcript quality

The pipeline is intentionally captions-first:

- it is cheaper and faster than full ASR
- it keeps the first version simple and auditable
- rows expose transcript status and source so reviewers can see coverage
- it satisfies the exercise requirement to use AI transcription or reliable captions

When captions are unavailable, the current implementation keeps the row but marks transcript availability clearly. A future version can add Whisper-based audio fallback.

## Deployment

The included workflow under `.github/workflows/deploy.yml` is set up for:

- manual runs
- scheduled refreshes every 6 hours
- snapshot rebuilds that commit updated `data/` and `docs/` back into the repository

The public browser page is served from the repository snapshot using a CDN-backed GitHub file URL:

- `https://raw.githack.com/jzy13357737150-eng/llm-youtube-landscape-tracker/main/docs/index.html`

If you want optional LLM enrichment in automation, add `OPENAI_API_KEY` as a GitHub Actions secret. Otherwise the scheduled pipeline still runs in captions-first mode.

## Demo mode

If a live run cannot complete, the project falls back to a fixture dataset so the UI and repo remain reviewable.

This is useful for:

- local setup without API keys
- repo previews
- keeping the table experience inspectable while wiring deployment secrets
