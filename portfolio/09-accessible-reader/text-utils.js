/**
 * text-utils.js
 *
 * Pure, framework-free, DOM-free, Web-Speech-API-free text logic used by the
 * Accessible Reader app. Everything here is plain data-in/data-out so it can
 * be unit tested with Node's built-in test runner without a browser.
 *
 * Exports:
 *  - splitIntoChunks(text): string[]
 *  - estimateReadingSeconds(text, wordsPerMinuteAtRate1): number
 *  - countWords(text): number
 */

/**
 * Split arbitrary input text into reasonably sized "chunks" (roughly
 * sentences) suitable for driving reading/highlighting UI.
 *
 * Rules:
 *  - Splits on '.', '!', '?' followed by whitespace (or end of string),
 *    keeping the punctuation attached to the chunk.
 *  - Also treats blank lines / newlines as soft boundaries so that text
 *    with no terminal punctuation (e.g. a list of lines) is still broken
 *    into manageable pieces instead of being read as a single giant chunk.
 *  - A single sentence with no punctuation at all and no newlines is
 *    returned as one chunk (there is nothing sensible to split on).
 *  - Empty / whitespace-only input returns an empty array.
 *  - Collapses internal runs of whitespace within a chunk to single spaces,
 *    but does not alter the words themselves.
 *
 * @param {string} text
 * @returns {string[]} array of non-empty, trimmed chunk strings
 */
export function splitIntoChunks(text) {
  if (typeof text !== 'string') return [];

  const normalized = text.replace(/\r\n/g, '\n');
  if (normalized.trim().length === 0) return [];

  // First split on newlines to treat paragraph/line breaks as boundaries.
  const lines = normalized.split('\n');

  const chunks = [];

  for (const line of lines) {
    if (line.trim().length === 0) continue;

    // Split the line into sentences, keeping the terminating punctuation.
    // Matches a run of non-terminator characters followed by one of . ! ?
    // (possibly repeated, e.g. "?!" or "...") and any trailing quote/paren.
    const sentenceRegex = /[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g;
    const matches = line.match(sentenceRegex);

    if (!matches) continue;

    for (const raw of matches) {
      const cleaned = raw.replace(/\s+/g, ' ').trim();
      if (cleaned.length > 0) chunks.push(cleaned);
    }
  }

  return chunks;
}

/**
 * Count words in a string (whitespace-delimited tokens, ignoring empty
 * tokens produced by repeated whitespace).
 *
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Compute the position (start/end character index) of every whitespace-
 * delimited word in a string. Pure string/regex math — used by the UI layer
 * to build per-word highlight targets and to map a Web Speech API
 * `onboundary` event's `charIndex` back to a specific word, without this
 * module itself touching the DOM.
 *
 * @param {string} text
 * @returns {{word: string, start: number, end: number}[]}
 */
export function getWordBoundaries(text) {
  if (typeof text !== 'string' || text.length === 0) return [];

  const boundaries = [];
  const regex = /\S+/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    boundaries.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return boundaries;
}

/**
 * Given the word boundaries produced by getWordBoundaries and a character
 * index (as reported by SpeechSynthesisUtterance's `onboundary` event),
 * return the index of the word that character index falls within.
 *
 * Falls back to the nearest preceding word if charIndex lands exactly on a
 * boundary edge or on whitespace (some browsers report slightly different
 * offsets), and returns -1 if there is no such word (e.g. empty list or a
 * negative index).
 *
 * @param {{word: string, start: number, end: number}[]} boundaries
 * @param {number} charIndex
 * @returns {number} index into boundaries, or -1 if none found
 */
export function findWordAtIndex(boundaries, charIndex) {
  if (!Array.isArray(boundaries) || boundaries.length === 0) return -1;
  if (typeof charIndex !== 'number' || Number.isNaN(charIndex) || charIndex < 0) {
    return -1;
  }

  for (let i = 0; i < boundaries.length; i++) {
    const b = boundaries[i];
    if (charIndex >= b.start && charIndex < b.end) return i;
  }

  // charIndex fell in whitespace between words (or past the last word's
  // start but not matched above) — use the nearest preceding word.
  let candidate = -1;
  for (let i = 0; i < boundaries.length; i++) {
    if (boundaries[i].start <= charIndex) candidate = i;
    else break;
  }
  return candidate;
}

/**
 * Estimate how many seconds it will take speechSynthesis to read the given
 * text at a given playback rate.
 *
 * Web Speech API "rate" is a multiplier where 1.0 is normal speed. We
 * assume a baseline reading speed (words per minute) at rate 1.0, then
 * scale by the requested rate. Rate is clamped to the Web Speech API's
 * valid range (0.1 - 10) and defaults to 1 for invalid input.
 *
 * @param {string} text
 * @param {number} [rate=1] playback rate multiplier
 * @param {number} [baselineWpm=150] assumed words-per-minute at rate 1.0
 * @returns {number} estimated duration in seconds (0 for empty text)
 */
export function estimateReadingSeconds(text, rate = 1, baselineWpm = 150) {
  const words = countWords(text);
  if (words === 0) return 0;

  let safeRate = typeof rate === 'number' && !Number.isNaN(rate) ? rate : 1;
  safeRate = Math.min(10, Math.max(0.1, safeRate));

  const safeWpm = baselineWpm > 0 ? baselineWpm : 150;
  const effectiveWpm = safeWpm * safeRate;

  const minutes = words / effectiveWpm;
  return Math.round(minutes * 60 * 100) / 100; // round to 2 decimals
}
