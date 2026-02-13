# Brain Builder

A lightweight app to gamify learning across multiple topics with streaks, mastery tracking, and flashcard drills. Data syncs across all your devices via Netlify Blobs.

## Quick Start (local dev)

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Link to your Netlify site (first time only)
netlify link

# Run locally with functions support
netlify dev
```

This runs the site with the serverless function so cloud sync works locally too.

## Deploy to Netlify

**First time:**
1. Push this folder to a GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → "Import from Git"
3. Select your repo — Netlify auto-detects the `netlify.toml` config
4. Deploy. Done.

**Or via CLI:**
```bash
netlify deploy --prod
```

## Security

The sync API is protected by a simple passphrase in `netlify/functions/state.mjs`. Change the `PASSPHRASE` constant to something only you know, and update the matching `AUTH` constant in `storage.js`.

## How Sync Works

- **Local cache**: localStorage for instant page loads
- **Cloud sync**: Netlify Functions + Netlify Blobs store your state as a single JSON blob
- **On page load**: renders from local cache immediately, then fetches cloud state and re-renders if different
- **On save**: writes to local cache instantly, debounces cloud save by 500ms
- **On page unload**: flushes to cloud via `keepalive` fetch
- **Export/Import** still works as a manual JSON backup

## File Structure

```
brain-builder/
  index.html               — Home / Dashboard
  topic.html               — Topic detail (cards, notes)
  drill.html               — Flashcard sprint
  styles.css               — Dark theme styles
  app.js                   — Shared bootstrap + state management
  storage.js               — Cloud sync + localStorage cache
  streaks.js               — Streak calculations
  mastery.js               — Mastery score formula
  drills.js                — Flashcard sprint engine
  ui.js                    — UI helpers (modals, components)
  netlify.toml             — Netlify build config
  netlify/functions/
    state.mjs              — Serverless function for GET/PUT state
```
