# Accessible Reader

A free, offline-capable text-to-speech reading tool built for **visually impaired and low-vision users** — and for anyone (dyslexic readers, people with eye strain, multitaskers, second-language learners) who reads better by ear. Paste in text, or load a `.txt` file, and have it read aloud with live word-by-word highlighting, adjustable speed and voice, an adjustable font size, and a high-contrast theme.

It runs entirely in the browser. No text is ever sent to a server, no account, no API key, and no internet connection is required once the page has loaded.

## Why zero dependencies / no build step

This project is deliberately built with plain HTML, CSS, and vanilla JavaScript (ES modules) — no framework, no bundler, no `npm install` of runtime dependencies:

- **The whole point is offline reliability.** A visually impaired user relying on this tool for accessibility should not be blocked by a broken CDN, a failed build, or a JavaScript framework that fails to hydrate. A handful of static files that a browser can parse directly is the most robust thing you can ship.
- **The Web Speech API is already built into the browser.** `window.speechSynthesis` and `SpeechSynthesisUtterance` need no library — reaching for a wrapper package would only add a maintenance burden for no benefit.
- **Fewer moving parts, easier to audit.** Anyone (including a screen-reader user's own technical helper) can open three small files and understand exactly what the page does.

The only tooling used is Node's own built-in test runner (`node --test`), and only for testing the pure logic module — not for running or building the site itself.

## How to open it

Because the JavaScript uses ES modules (`<script type="module">`), most browsers will not execute it correctly from a `file://` URL due to module CORS restrictions. Serve the folder over plain HTTP instead:

```bash
cd 09-accessible-reader
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` in a real desktop or mobile browser (Chrome, Edge, Firefox, or Safari all support the Web Speech API to varying degrees; Chrome/Edge have the broadest voice selection).

**Important:** The Web Speech API is a *browser* API. It does not exist in Node.js, in a headless test runner, or in any non-browser CLI context — there is no way to "run" the speech playback itself outside an actual browser window with audio output. You must open the page in a real browser to hear it speak.

## Accessibility features implemented

- **Semantic HTML & landmarks** — `<header>`, `<main>`, `<footer>`, real `<label for>` associations on every input, a "skip to main content" link for keyboard/screen-reader users.
- **Full keyboard operability** — every control (textarea, file input, selects, sliders, buttons) is a native, focusable HTML element reachable by <kbd>Tab</kbd>. Global shortcuts: <kbd>Alt+P</kbd> to play/pause/resume, <kbd>Alt+S</kbd> to stop.
- **Visible focus states** — a high-contrast 3px focus outline (`:focus-visible`) on every interactive element, distinct from hover styling.
- **ARIA labelling and live regions** — playback controls are grouped with `role="group"` and `aria-label`; the reading preview announces itself via `aria-label`; a visually-hidden `aria-live="polite"` status region announces state changes ("Playing", "Paused", "Stopped", "Finished reading", voice list loaded, file loaded, errors) to screen-reader users without moving visual focus.
- **Live word/sentence highlighting** — driven by the utterance's real `onboundary` event, so a low-vision user can visually track exactly which word is being spoken as it happens.
- **Adjustable font size** — a slider (14px–40px) updates a CSS custom property (`--user-font-size`) applied to the whole page, with the current value reflected in an `<output>` element and `aria-valuenow`.
- **High-contrast theme toggle** — a `[data-theme="high-contrast"]` attribute swaps the entire palette to a black background with yellow/cyan accents (compliant with WCAG contrast guidance), toggled by a button with `aria-pressed` state.
- **Large touch targets** — all buttons, selects, and range inputs have a minimum 44×44px hit area, per WCAG 2.5.5 / mobile accessibility guidance.
- **No color-only signaling** — the current word/sentence is marked with both a background color *and* underline/shape change, not color alone.

## Architecture

- `index.html` — markup and ARIA structure.
- `style.css` — theming (default + high-contrast), focus states, layout.
- `text-utils.js` — **pure, DOM-free, Web-Speech-API-free logic**, exported as ES module functions:
  - `splitIntoChunks(text)` — splits arbitrary text into sentence-ish chunks (on `.`/`!`/`?` and newlines) for sequential playback and highlighting.
  - `countWords(text)` — whitespace-delimited word count.
  - `getWordBoundaries(text)` — computes the start/end character index of every word in a string.
  - `findWordAtIndex(boundaries, charIndex)` — maps a `SpeechSynthesisUtterance` `onboundary` event's `charIndex` back to a specific word.
  - `estimateReadingSeconds(text, rate, baselineWpm)` — estimates reading duration from word count and playback rate.
- `script.js` — the browser/DOM layer. Imports the functions above (`import ... from './text-utils.js'`) and uses them to actually drive `speechSynthesis`: it builds one `SpeechSynthesisUtterance` per chunk from `splitIntoChunks`, queues them in order, and uses `getWordBoundaries`/`findWordAtIndex` inside the `onboundary` handler to highlight the exact word being spoken. This file is intentionally "dumb" — no text-splitting logic is reimplemented here.
- `text-utils.test.js` — Node test-runner unit tests for every function in `text-utils.js`.

## Running the logic tests

```bash
cd 09-accessible-reader
npm test
```

This runs `node --test`, which discovers and executes `text-utils.test.js` using Node's built-in test runner (no dependencies to install). It covers: empty input, a single long sentence with no punctuation, multiple sentences with mixed `.`/`!`/`?` punctuation, text containing newlines, whitespace collapsing, word-boundary computation, and rate clamping/edge cases for the duration estimate.

Only the pure logic in `text-utils.js` is automation-tested this way, since the Web Speech API itself has no Node.js implementation. The `speechSynthesis` integration in `script.js` has been manually reviewed against the API (correct event handlers, queuing behavior, pause/resume/cancel semantics) but — by the nature of a browser-only API — cannot be exercised by an automated test outside a real browser with audio output.
