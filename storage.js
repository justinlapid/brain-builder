/* storage.js — cloud sync with localStorage cache */

const STORAGE_KEY = 'brainbuilder_state';
const API_URL = '/api/state';
const AUTH = '123'; // Must match the function passphrase

const DEFAULT_STATE = {
  version: 1,
  topics: [],
  progress: {},
};

/** Save to localStorage as fast cache */
function cacheLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

/** Load from localStorage cache */
function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) return parsed;
    return null;
  } catch {
    return null;
  }
}

/** Load state — tries cloud first, falls back to local cache */
export async function loadStateAsync() {
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { 'x-bb-auth': AUTH },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.version === 1) {
        cacheLocal(data);
        return data;
      }
    }
  } catch {
    // Cloud unavailable, fall back to local
  }
  return loadLocal() || structuredClone(DEFAULT_STATE);
}

/** Synchronous load from cache (for immediate render) */
export function loadState() {
  return loadLocal() || structuredClone(DEFAULT_STATE);
}

let _saveTimer = null;
let _saving = false;

/** Save state — writes to local cache immediately, debounces cloud save */
export function saveState(state) {
  cacheLocal(state);
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => saveToCloud(state), 500);
}

/** Force immediate cloud save (used before page unload) */
export function saveStateNow(state) {
  cacheLocal(state);
  try {
    fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-bb-auth': AUTH },
      body: JSON.stringify(state),
      keepalive: true,
    });
  } catch { /* best effort */ }
}

async function saveToCloud(state) {
  if (_saving) return;
  _saving = true;
  try {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-bb-auth': AUTH },
      body: JSON.stringify(state),
    });
    if (!res.ok) console.warn('Brain Builder: cloud save failed', res.status);
  } catch (e) {
    console.warn('Brain Builder: cloud save error', e);
  } finally {
    _saving = false;
  }
}

/** Export state as downloadable JSON file */
export function exportState(state) {
  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `brainbuilder-backup-${ts}.json`;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Import state from a JSON file */
export function importState(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.topics)) {
          reject(new Error('Invalid backup file format.'));
          return;
        }
        if (!parsed.progress || typeof parsed.progress !== 'object') {
          parsed.progress = {};
        }
        cacheLocal(parsed);
        await saveToCloud(parsed);
        resolve(parsed);
      } catch {
        reject(new Error('Could not parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}
