# Brain Builder

A lightweight app to gamify learning across multiple topics with streaks, mastery tracking, and flashcard drills. Data syncs across all devices via Netlify Blobs.

**Live site:** [primebrainbuilder.netlify.app](https://primebrainbuilder.netlify.app)

## Making Changes

Edit files in Cursor, then:

```bash
git add -A
git commit -m "describe what you changed"
git push
```

Netlify auto-deploys in ~30 seconds.

## How Sync Works

- **localStorage** caches state for instant page loads
- **Netlify Functions + Blobs** store state in the cloud
- On page load: renders from local cache, then fetches cloud state and re-renders if newer
- On save: writes local immediately, debounces cloud save by 500ms
- On page unload: flushes to cloud via `keepalive` fetch
- **Export/Import** buttons provide manual JSON backup

## File Structure

```
brain-builder/
├── index.html                  Home / Dashboard
├── topic.html                  Topic detail (cards, notes)
├── drill.html                  Flashcard sprint
├── styles.css                  Dark theme styles
├── app.js                      State management + routing
├── storage.js                  Cloud sync + localStorage cache
├── streaks.js                  Streak calculations
├── mastery.js                  Mastery score formula
├── drills.js                   Flashcard sprint engine
├── ui.js                       UI helpers (modals, components)
├── netlify.toml                Netlify build config
├── netlify/functions/
│   └── state.mjs               Serverless function for state sync
├── package.json
└── package-lock.json
```

## Local Development

```bash
npm install -g netlify-cli   # first time only
netlify link                 # first time only
netlify dev                  # runs site + functions locally
```
