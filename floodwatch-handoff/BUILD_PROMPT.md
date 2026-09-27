# FloodWatch — Build Spec for IBM Bob

This is the exact structured specification CityMind's "Build with IBM Bob" page generates
for the Recurring Urban Flooding demo project (Hyderabad). It's the output of CityMind's
own pipeline: evidence → AI analysis → solution design → solution blueprint → this prompt.

**How to use this file:** open IBM Bob, point it at this file (or paste its contents into
the chat), and ask Bob to scaffold and build FloodWatch from the spec below. Treat this repo
folder as a fresh starting point — don't pre-build anything here; let Bob do the real work
so the session is genuine evidence for judging.

---

PRODUCT NAME
FloodWatch

PROBLEM / CONTEXT
Residents and local organizations have reported repeated waterlogging in this area during
periods of heavy rainfall. We want to understand the recurring pattern and explore a
technology-based monitoring and response solution.

Location: Yousufguda & Erragadda, Hyderabad
Category: Flooding & Drainage

USERS
  - Municipal teams
  - Field workers
  - Civic organizations
  - Citizens

OBJECTIVE
Enable faster reporting, mapping and response to recurring flooding incidents.

FEATURES
  - Flood incident reporting
  - Interactive incident map
  - Severity classification
  - Photo/location evidence
  - Response status
  - Municipal dashboard
  - Historical incident analytics

SCREENS
  - Login: Role-based sign-in for citizens and municipal staff.
  - Incident reporting: Form for submitting a new flood report with photo and location.
  - Map: Live map of reported incidents with severity markers.
  - Incident details: Full record of a single incident including status history.
  - Municipal dashboard: Aggregated operational view for response teams.
  - Analytics: Trends in incident frequency and location over time.

USER FLOWS
  - Citizen: Report incident -> Attach photo -> Share location -> Submit
  - Municipal team: View incident -> Verify -> Assign response -> Update status

DATABASE SCHEMA
  Incident:
    - id: uuid
    - location: text
    - latitude: float
    - longitude: float
    - timestamp: timestamptz
    - severity: enum(low, medium, high, critical)
    - description: text
    - photo: text (storage url)
    - status: enum(reported, verified, in_progress, resolved)
  Response:
    - id: uuid
    - incident_id: uuid (fk -> Incident)
    - assigned_team: text
    - status: enum(pending, dispatched, resolved)
    - notes: text
    - updated_at: timestamptz

TECHNICAL REQUIREMENTS
  - React + TypeScript frontend
  - Supabase-compatible backend (Postgres, auth, storage for photos)
  - Map integration (Leaflet/OpenStreetMap) for incident locations
  - Role-based access: citizen vs municipal team
  - Mobile-responsive incident reporting flow

ACCEPTANCE CRITERIA
  - A user can submit a flood incident with location and photo.
  - A municipal user can view reported incidents on a map.
  - A municipal user can update response status.
  - The dashboard displays incident trends.

---

## If time is short: build-order priority

Bob sessions in a hackathon are time-boxed, so if you can't get everything above working,
build in this order for maximum demo impact:

1. Incident reporting form (photo + location + severity) — this is the most "real" screen
2. Map view showing submitted incidents — this is the most visually convincing screen
3. Municipal dashboard (list + status update) — this closes the loop citizen → response
4. Analytics — nice to have, lowest priority if time runs out

Getting 1–3 fully working and demoable beats getting all 6 screens half-working.
