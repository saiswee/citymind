# CityMind

AI workspace for civic organizations, municipal teams, civic-tech developers, and researchers to turn real-world urban challenges into buildable technology solutions.

> **Building this for the IBM Bob 2.0 Hackathon?** See [`HACKATHON.md`](./HACKATHON.md) for
> the submission checklist, deployment steps, and how to hand this off to Bob — start there,
> not here.

Demo scenario: **Recurring Urban Flooding** in Yousufguda & Erragadda, Hyderabad.

## Workflow

Urban challenge → Evidence → AI Analysis → Solution Design → Solution Blueprint → Build with IBM Bob

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. The flooding demo project on the dashboard has the full journey pre-populated — open it to see Overview, Evidence, Timeline, AI Analysis, Solution Design, and the Solution Blueprint already generated. The other two demo projects (Waste Collection Gaps, Pedestrian Safety Near Schools) show earlier workflow stages.

To try the full pipeline from scratch, use **+ Start a Civic Project** to create a new project, add a few evidence items, then run **Analyze Challenge → Design a Solution → Generate Blueprint → Generate IBM Bob Build Prompt**.

## Architecture

- **React + TypeScript + Vite + Tailwind CSS v4**
- `src/types` — domain model (projects, evidence, timeline events, analysis, solutions, blueprints, build prompts)
- `src/data/seed.ts` — demo data for the Hyderabad flooding scenario
- `src/services/store.ts` — data layer shaped like Supabase tables (`projects`, `evidence`, `timeline_events`, `analyses`, `solutions`, `build_prompts`); currently backed by localStorage, swappable for a real Supabase client
- `src/services/ai.ts` — `analyzeChallenge()`, `generateSolution()`, `generateBlueprint()`, `generateBuildPrompt()`; currently mock implementations, designed to be replaced with real AI API calls without touching the UI
- `src/pages` — Dashboard, Start a Civic Project, Explore, How It Works, and the Project Workspace (Overview, Evidence, Timeline, AI Analysis, Solution Design, Solution Blueprint, Build with IBM Bob)

## Notes

CityMind does not control cities, make government decisions, or replace municipal officials — it structures a civic challenge into a build-ready specification. IBM Bob is the separate tool that takes that specification and helps build the actual application; this app only produces and hands off the prompt, it does not integrate with a real IBM Bob API.
