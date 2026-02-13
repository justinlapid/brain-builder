/* app.js — shared app bootstrap + router helpers */

import { loadState, loadStateAsync, saveState, saveStateNow } from './storage.js';

/** Get query param value */
export function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/** App state — loads from local cache immediately, then syncs from cloud */
let _state = null;

/** Synchronous getter — uses local cache for instant render */
export function getState() {
  if (!_state) _state = loadState();
  return _state;
}

/** Async init — fetches cloud state, calls onReady with updated state */
export async function initState(onReady) {
  // Render immediately with local cache
  _state = loadState();
  onReady(_state);

  // Then fetch from cloud and re-render if different
  try {
    const cloud = await loadStateAsync();
    if (cloud && JSON.stringify(cloud) !== JSON.stringify(_state)) {
      _state = cloud;
      onReady(_state);
    }
  } catch { /* stay with local */ }
}

export function persistState() {
  if (_state) saveState(_state);
}

/** Flush to cloud before page unload */
window.addEventListener('beforeunload', () => {
  if (_state) saveStateNow(_state);
});

/** Find a topic by id */
export function findTopic(topicId) {
  return getState().topics.find(t => t.id === topicId) || null;
}
