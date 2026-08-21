# Model Card — Incident Classifier

The "AI" in the pipeline is a prompt-engineered wrapper around Google Gemini. There
is no trained/fine-tuned in-house model; behavior is defined entirely by the prompt
and post-processing in [`lib/ai-analysis.ts`](../lib/ai-analysis.ts).

## Model
- **Provider:** Google Gemini via `@google/generative-ai`.
- **Models (in fallback order):** `gemini-flash-latest` → `gemini-2.0-flash-lite`
  → `gemini-2.5-flash`. Exact ids are defined at the top of `lib/ai-analysis.ts`.
- **Access:** up to 9 API keys (`GEMINI_API_KEY_1..8` + `GEMINI_API_KEY`) rotated on
  quota/availability errors.

## Task
Given one Bengali news article (title + body + publish date + source), produce a
strict-JSON judgment used to create or reject a `PoliticalEvent`.

### Inputs
- `articleText`, `title`, `url`, `publishedAt`, `sourceName`.

### Outputs (JSON)
- `is_political_violence` (bool) and a `decision_trace`
  (recency / violence-type / in-Bangladesh / exclusion reason)
- `title`, `summary` (Bengali, relative-time stripped)
- `incident_date`, `location { spot, district }`, `incident_type`
- `casualties { killed, injured, estimated }`
- `parties_involved[]`, `severity_score` (1–10)
- `confidence` (0.0–0.99), `evidence[]`
- `category` ∈ { Political Violence, Criminal Violence, Mob Justice / Lynchings,
  Gender-Based Violence, Terrorism / Extremist Attacks,
  Communal / Religious Violence }
- `tags[]`, `category_reasoning`

## Decision logic (in the prompt)
1. **Recency filter** — incidents older than ~14 days (or explicitly historical)
   are rejected.
2. **Relevance filter** — includes physical clashes, attacks, arson, fatalities
   from conflict/crime; **excludes** road accidents, natural deaths, peaceful
   protests, simple arrests, court proceedings, and fiction.
3. **Bangladesh-only** — non-BD incidents rejected.
4. **Categorization** — exactly one of the six categories; `Criminal Violence` is
   the default for ambiguous real-violence cases.

## Post-processing safety nets (code, not the model)
- `confidence` hard-capped at 0.99.
- Future `incident_date` clamped to the publish date; dates >30 days old flip the
  record to non-violence.
- Year hallucinations corrected to the publish year; relative-time words removed
  from summaries.

## Deduplication
A second Gemini call (`checkDuplicateWithAI`) plus `string-similarity` heuristics
decide whether a new article is a follow-up/duplicate of an existing event and
should be merged rather than created. See [DATA_PIPELINE.md](DATA_PIPELINE.md).

## Known limitations
- **Quota-bound:** on the free tier the pipeline stalls once daily quota is spent;
  the backlog then grows until quota resets or a billed key is added.
- **Source-dependent:** classification quality depends on article completeness;
  truncated or paywalled bodies reduce accuracy.
- **No human-in-the-loop by default** for event creation (social posts do have a
  review queue). Confidence is exposed per event for downstream filtering.
- **Not a legal/authoritative record** — data is aggregated from third-party news
  and surfaced with a disclaimer.

## Transparency in the product
The export tool surfaces the decision basis directly: the **events** export has an
`AI Decision Reasoning` column, and the **Decision Audit** dataset labels every raw
article `Published` / `Processed — not published` / `Pending` with reasoning. See
[API.md](API.md#download-api).
