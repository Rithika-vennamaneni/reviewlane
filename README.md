# ReviewLane

Human review + evaluation layer for LLM safety — track reviewer disagreement, quality signals, and drift over time.

**Status:** In progress (MVP target: <DATE>)  
**What works today:** Basic pipeline + schema + initial UI skeleton.  
**Next milestone:** End-to-end demo: submit sample outputs → review → dashboard signals.

## Why this exists
Most safety pipelines log model outputs, but lose the *human judgment layer* — who reviewed, what they disagreed on, and what patterns are changing over time.
ReviewLane makes human review measurable and queryable.

Motivation: scalable supervision approaches emphasize small amounts of high-quality human oversight as AI systems grow more capable. ReviewLane extends this by treating human judgment itself as a measurable part of the safety system, helping teams identify policy gray areas and improve governance without replacing humans.

## MVP demo (goal)
1. Ingest a batch of model outputs (JSON)
2. Review them in a simple UI (approve / reject / label + notes)
3. Dashboard shows: disagreement rate, top issue categories, drift over time
4. Add a “Repo map” (so people understand it in 10 seconds)

## Repo structure
- /app/web: Next.js app + API routes + Prisma schema
- /docs: architecture, review schema, evaluation framework
- /scripts: python analysis helpers + sample data

## How ReviewLane works (MVP demo)

### 1. Human review as structured signal
Reviewers assess model outputs using constrained decisions, issue tags, and confidence — treating disagreement as signal, not noise.

![Human review screen](docs/images/review.png)

---

### 2. Oversight metrics from human judgment
ReviewLane aggregates reviews into system-level signals like disagreement rate, issue drivers, and confidence calibration.

![Metrics dashboard](docs/images/metrics.png)

---

### 3. Drift detection across batches
By comparing review distributions across batches, ReviewLane surfaces emerging or declining risk patterns over time.

![Drift comparison](docs/images/compare.png)


## 2-minute demo
1. Install dependencies:
   `cd app/web`
   `npm install`
2. Create the local environment file:
   `cp .env.example .env`
3. Initialize the local SQLite database:
   `npm run db:setup`
4. Seed two batches:
   `npm run seed`
5. Run the app:
   `npm run dev`
6. Open `http://localhost:3000`

### Demo flow (multi-reviewer)
1. Set reviewer id (top right). Use `reviewer_01`.
2. Pick `batch_a`, open 2–3 items, submit reviews.
3. Switch reviewer id to `reviewer_02` and review the same items with a different decision/tag.
4. Visit `/metrics?batch_id=batch_a` to see disagreement rate, top tags, confidence calibration.
5. Visit `/compare` and compare `batch_a` vs `batch_b` to see drift deltas.

## Acknowledgements & Tooling

This project was developed by the author, with AI assistance used as a collaborative tool. Large language models (including Anthropic’s Claude and OpenAI’s ChatGPT) were used for brainstorming, refining written explanations, and assisting with code scaffolding and debugging.
