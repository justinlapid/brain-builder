/* mastery.js — per-topic mastery score calculation */

import { todayStr } from './streaks.js';

/** Compute mastery score for a topic (0-100) */
export function computeMastery(progress, topicId) {
  const sessions = progress[topicId]?.sessions || [];
  if (sessions.length === 0) return 0;

  const recent = sessions.slice(-10);
  const avgScore = recent.reduce((sum, s) => sum + s.scorePct, 0) / recent.length;
  const avgConfidence = recent.reduce((sum, s) => sum + ((s.confidence - 1) / 4) * 100, 0) / recent.length;

  const lastDate = sessions[sessions.length - 1].date;
  const daysSince = daysBetween(lastDate, todayStr());
  const recency = Math.max(0, 100 - daysSince * 10);

  const mastery = Math.round(0.5 * avgScore + 0.25 * avgConfidence + 0.25 * recency);
  return Math.max(0, Math.min(100, mastery));
}

function daysBetween(dateA, dateB) {
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}
