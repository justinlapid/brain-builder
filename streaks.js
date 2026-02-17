/* streaks.js — per-topic, global, and perfect day streak calculations */

/** Get today's date string in YYYY-MM-DD */
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Get a date string N days ago */
function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Get unique session dates for a topic, sorted desc */
function getSessionDates(progress, topicId) {
  const sessions = progress[topicId]?.sessions || [];
  const dates = [...new Set(sessions.map(s => s.date))];
  dates.sort((a, b) => b.localeCompare(a));
  return dates;
}

/** Compute streak from a sorted-desc array of date strings.
 *  Counts consecutive days starting from today or yesterday. */
function computeStreak(datesDesc) {
  if (datesDesc.length === 0) return 0;
  const today = todayStr();
  const yesterday = daysAgoStr(1);

  let startOffset;
  if (datesDesc[0] === today) {
    startOffset = 0;
  } else if (datesDesc[0] === yesterday) {
    startOffset = 1;
  } else {
    return 0;
  }

  const dateSet = new Set(datesDesc);
  let streak = 0;
  for (let i = startOffset; ; i++) {
    if (dateSet.has(daysAgoStr(i))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Topic streak: consecutive days this topic was practiced */
export function topicStreak(progress, topicId) {
  return computeStreak(getSessionDates(progress, topicId));
}

/** Global streak: consecutive days with any session on any topic */
export function globalStreak(progress) {
  const allDates = new Set();
  for (const topicId of Object.keys(progress)) {
    for (const s of progress[topicId].sessions || []) {
      allDates.add(s.date);
    }
  }
  const sorted = [...allDates].sort((a, b) => b.localeCompare(a));
  return computeStreak(sorted);
}

/** Check if a topic was done on a given date */
export function topicDoneOnDate(progress, topicId, date) {
  const sessions = progress[topicId]?.sessions || [];
  return sessions.some(s => s.date === date);
}

/** Check if today is done for a topic */
export function topicDoneToday(progress, topicId) {
  return topicDoneOnDate(progress, topicId, todayStr());
}

/** Count how many active topics are done today */
export function todayProgress(topics, progress) {
  const done = topics.filter(t => topicDoneToday(progress, t.id));
  return { done: done.length, total: topics.length };
}

/** Check if a date is a "Perfect Day" (all active topics done) */
export function isPerfectDay(topics, progress, date) {
  if (topics.length === 0) return false;
  return topics.every(t => topicDoneOnDate(progress, t.id, date));
}

/** Perfect Day streak: consecutive perfect days */
export function perfectDayStreak(topics, progress) {
  if (topics.length === 0) return 0;

  const today = todayStr();
  const yesterday = daysAgoStr(1);
  const todayPerfect = isPerfectDay(topics, progress, today);
  const yesterdayPerfect = isPerfectDay(topics, progress, yesterday);

  let startOffset;
  if (todayPerfect) {
    startOffset = 0;
  } else if (yesterdayPerfect) {
    startOffset = 1;
  } else {
    return 0;
  }

  let streak = 0;
  for (let i = startOffset; ; i++) {
    if (isPerfectDay(topics, progress, daysAgoStr(i))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
