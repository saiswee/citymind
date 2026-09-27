# CityMind — IBM Bob 2.0 Hackathon Submission Plan

Event: IBM Bob 2.0 Hackathon (lablab.ai), Sept 25–27, 2026.
This doc exists to make sure the submission actually scores well, not just looks good.

## The one thing that matters most

Judges are looking for **Bob IDE used as a core, demonstrable part of how you built this** —
not a product that talks about Bob. Based on other teams' public repos for this same event,
the expected evidence is a `bob_sessions/` folder with exported session reports or
screenshots proving Bob did real work. A prompt-generator UI alone will read as "designed
for Bob," not "built with Bob." That has to change before you submit.

**The fix:** don't just show the prompt — actually feed it to Bob and let Bob build the
downstream app (FloodWatch) live, then export that session. This repo already has a clean
starting point for that in `floodwatch-handoff/` (see below).

## Submission checklist (lablab.ai baseline + IBM-specific)

- [x] Slide deck (PDF + editable PPTX) — `pitch/citymind-pitch-deck.pdf` / `.pptx`
- [x] Pitch video script, timed to 5:00 — `pitch/VIDEO_SCRIPT.md` (just needs recording)
- [x] MIT license — `LICENSE`
- [x] CI (typecheck + build on push) — `.github/workflows/ci.yml`
- [ ] Public GitHub repository (this one) — make sure it's public before the deadline
- [ ] Working prototype reachable by URL
  - The claude.ai artifact link works but runs in a sandboxed preview (map tiles, geocoding,
    and the Wikimedia images are blocked by its content policy). **Deploy the real build
    instead** — see "Deploy a fully working URL" below. Takes about 5 minutes.
- [ ] Record the pitch video from `pitch/VIDEO_SCRIPT.md` (≤5 minutes, MP4)
- [ ] `bob_sessions/` folder with exported Bob session reports/screenshots (see that folder's README)
- [ ] Remove any API keys/credentials before pushing (this project has none by default —
      geocoding uses the public Nominatim endpoint, no key required)
- [ ] Fill in your team name on the deck's closing slide (`pitch/citymind-pitch-deck.pptx`)

## Deploy a fully working URL (pick one, ~5 min each)

```bash
# Netlify (simplest — drag-and-drop also works via app.netlify.com/drop)
npm run build
npx netlify-cli deploy --prod --dir=dist

# Vercel
npm run build
npx vercel --prod

# GitHub Pages
npm install -D gh-pages
# add to package.json scripts: "deploy": "gh-pages -d dist"
npm run build && npm run deploy
```
Any of these gives judges a real link where the map tiles, geocoding search, and images all
work — the sandboxed artifact preview does not have full internet access.

## What to actually do with Bob (in priority order)

1. Open Bob with access granted at kickoff.
2. Point it at `floodwatch-handoff/BUILD_PROMPT.md` — this is the exact structured spec
   CityMind's own "Build with IBM Bob" page generates (product name, users, features,
   screens, data model, acceptance criteria). Ask Bob to scaffold FloodWatch from it.
3. Let Bob run for a real session — incident reporting form, map view, municipal dashboard
   are the highest-value screens to get working end-to-end if time is short.
4. Export the session history (Bob IDE → History tab → export/screenshot) into
   `bob_sessions/`. Do this for every meaningful session, not just one.
5. Record a short screen capture of Bob actually generating code — this is the single
   highest-impact clip for the pitch video.

## Judging-criteria alignment (why this project should score well)

- **Real use of Bob**: FloodWatch is built by Bob from a spec, not hand-written — once you
  complete the step above, this is your strongest point.
- **Problem clarity & impact**: grounded in a real, recurring civic problem (Hyderabad urban
  flooding), with a concrete before/after (recurring waterlogging → tracked, mapped,
  actioned incidents).
- **Technical depth**: CityMind itself is a complete, working multi-step pipeline (evidence →
  AI analysis with clearly-labeled confidence levels → solution design → structured
  blueprint → build spec) — not just a static mockup.
- **Originality**: most Bob submissions are "I used Bob to build X." This one is "I built a
  tool that turns real-world problems into the spec Bob needs, then used Bob to build the
  result" — a two-stage pipeline is a more interesting story than a single build.

## Suggested pitch video structure (5 minutes)

1. **0:00–0:30** — The problem: recurring Hyderabad flooding, real evidence (photo, historical
   map, rainfall data), why this is hard to act on today.
2. **0:30–1:30** — CityMind: evidence → AI analysis (show the evidence/gap distinction) →
   solution design → Solution Blueprint. Move fast, this is context for what's coming.
3. **1:30–2:00** — The handoff: "Generate IBM Bob Build Prompt" → show the generated spec.
4. **2:00–4:00** — **The main event**: Bob actually building FloodWatch from that spec, live
   or sped-up footage. This is what judges are scoring — give it the most screen time.
5. **4:00–5:00** — The result: FloodWatch running, tie back to the original problem, close.

## Suggested slide deck outline (6–8 slides)

1. Title + one-line pitch
2. The problem (real, specific, grounded — not abstract "cities have problems")
3. CityMind's pipeline (one diagram: Challenge → Evidence → Analysis → Solution → Blueprint)
4. The Solution Blueprint (screenshot — this is your most "product-like" artifact)
5. Built with Bob: the handoff prompt → Bob session screenshot(s)
6. FloodWatch: the resulting app (screenshots or short clip)
7. Impact / who this helps (municipal teams, civic orgs, citizens)
8. What's next / team

## Time check

Event ends Sept 27, 2026. Deploying the URL and prepping `floodwatch-handoff/` can be done
now, before Bob access opens. Everything Bob-related has to happen once access is live —
don't leave it to the last hour.
