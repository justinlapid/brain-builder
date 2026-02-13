/* ui.js — small UI helpers for vanilla JS */

/** Create an element with optional class, attrs, and children */
export function el(tag, opts = {}) {
  const elem = document.createElement(tag);
  if (opts.className) elem.className = opts.className;
  if (opts.text) elem.textContent = opts.text;
  if (opts.html) elem.innerHTML = opts.html;
  if (opts.attrs) {
    for (const [k, v] of Object.entries(opts.attrs)) elem.setAttribute(k, v);
  }
  if (opts.style) Object.assign(elem.style, opts.style);
  if (opts.children) opts.children.forEach(c => c && elem.appendChild(c));
  if (opts.onClick) elem.addEventListener('click', opts.onClick);
  return elem;
}

/** Generate a short unique id */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Render a mastery ring SVG (40x40) */
export function masteryRing(pct) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--accent)' : 'var(--text-muted)';

  const wrapper = el('div', { className: 'mastery-ring' });
  wrapper.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--bg-hover)" stroke-width="3"/>
      <circle cx="20" cy="20" r="${r}" fill="none" stroke="${color}" stroke-width="3"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
    </svg>
    <span class="mastery-ring-text" style="color:${color}">${pct}%</span>
  `;
  return wrapper;
}

/** Show a modal. Returns a close function. */
export function showModal(titleText, contentEl) {
  const overlay = el('div', { className: 'modal-overlay' });
  const modal = el('div', { className: 'modal' });
  const title = el('h2', { text: titleText });
  modal.appendChild(title);
  modal.appendChild(contentEl);
  overlay.appendChild(modal);

  const close = () => overlay.remove();

  // Only close when clicking the dark backdrop, not the modal itself
  overlay.addEventListener('mousedown', e => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
  return { overlay, close };
}

/** Confirm dialog. Returns a promise resolving to true/false. */
export function confirmDialog(message) {
  return new Promise(resolve => {
    const content = el('div');
    content.appendChild(el('p', { className: 'confirm-text', text: message }));

    const actions = el('div', { className: 'form-actions' });
    actions.appendChild(el('button', {
      className: 'btn', text: 'Cancel',
      onClick: () => { close(); resolve(false); }
    }));
    actions.appendChild(el('button', {
      className: 'btn btn-danger', text: 'Delete',
      onClick: () => { close(); resolve(true); }
    }));
    content.appendChild(actions);

    const { close } = showModal('Confirm', content);
  });
}

/** Preset topic colors */
export const TOPIC_COLORS = [
  '#e8a848', '#f87171', '#4ade80', '#60a5fa',
  '#c084fc', '#fb923c', '#2dd4bf', '#f472b6',
  '#a3e635', '#fbbf24',
];

/** Shuffle array (Fisher-Yates) */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Format seconds as M:SS */
export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
