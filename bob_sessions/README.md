# Bob Sessions

This folder is the evidence that IBM Bob was actually used to build part of this project —
it's what judges check for the "Bob IDE as a core component" criterion.

## What to put here

For each Bob session you run:

1. In Bob IDE's chat interface, open **Views → More Actions → History**.
2. Export the session (or screenshot the key exchanges if export isn't available).
3. Save it here as `session-01-<short-description>.md` (or `.png` for screenshots), e.g.:
   - `session-01-scaffold-floodwatch.md`
   - `session-02-incident-map.png`
   - `session-03-municipal-dashboard.md`

## Before you commit

- **Remove all credentials and API keys** from anything you export. IBM's security team
  checks for this, and leaked credentials in a public repo is a disqualifying issue, not a
  minor one.
- Keep the sessions in the order you ran them — judges may skim chronologically to see the
  build actually happen.
- A short caption at the top of each file (one line: what you asked Bob to do, what it
  produced) makes these much faster for judges to skim.

## Nothing here yet

This folder is currently empty — it needs real Bob sessions from the actual hackathon build,
which can only happen once Bob access opens. See `../HACKATHON.md` for the full plan.
