/* drills.js — flashcard sprint engine */

import { shuffle, formatTime } from './ui.js';

/** Create a drill session for a topic. */
export function createDrill(cards) {
  const MAX_CARDS = 10;
  const selected = shuffle(cards).slice(0, MAX_CARDS);

  return {
    cards: selected,
    total: selected.length,
    current: 0,
    correct: 0,
    startTime: Date.now(),
    revealed: false,
    finished: false,

    currentCard() {
      return this.cards[this.current] || null;
    },

    reveal() {
      this.revealed = true;
    },

    answer(gotIt) {
      if (gotIt) this.correct++;
      this.current++;
      this.revealed = false;
      if (this.current >= this.total) this.finished = true;
    },

    scorePct() {
      if (this.total === 0) return 0;
      return Math.round((this.correct / this.total) * 100);
    },

    durationSec() {
      return Math.round((Date.now() - this.startTime) / 1000);
    },

    durationFormatted() {
      return formatTime(this.durationSec());
    },
  };
}
