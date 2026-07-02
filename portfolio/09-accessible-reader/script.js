// script.js
//
// DOM + Web Speech API glue. All non-trivial text logic lives in
// text-utils.js (pure functions, unit tested with node --test); this file
// is the "dumb" layer that wires that logic up to real browser APIs and UI
// elements.

import {
  splitIntoChunks,
  getWordBoundaries,
  findWordAtIndex,
  estimateReadingSeconds,
} from './text-utils.js';

// ---------------------------------------------------------------------------
// Element references
// ---------------------------------------------------------------------------

const textInput = document.getElementById('text-input');
const fileInput = document.getElementById('file-input');
const voiceSelect = document.getElementById('voice-select');
const rateRange = document.getElementById('rate-range');
const rateValueOutput = document.getElementById('rate-value');
const durationEstimate = document.getElementById('duration-estimate');

const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const stopBtn = document.getElementById('stop-btn');

const readingOutput = document.getElementById('reading-output');
const readingPlaceholder = document.getElementById('reading-placeholder');

const fontSizeRange = document.getElementById('font-size-range');
const fontSizeValue = document.getElementById('font-size-value');
const contrastToggle = document.getElementById('contrast-toggle');
const contrastState = document.getElementById('contrast-state');

const statusRegion = document.getElementById('status-region');

// ---------------------------------------------------------------------------
// Feature detection
// ---------------------------------------------------------------------------

const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

if (!speechSupported) {
  announce(
    'Sorry, this browser does not support the Web Speech API, so text-to-speech playback is unavailable here. Try a recent version of Chrome, Edge, or Safari.'
  );
  [playBtn, pauseBtn, resumeBtn, stopBtn].forEach((btn) => {
    if (btn) btn.disabled = true;
  });
}

// ---------------------------------------------------------------------------
// Playback state
// ---------------------------------------------------------------------------

/** @type {{ chunkEl: HTMLElement, wordEls: HTMLElement[], boundaries: {word:string,start:number,end:number}[] }[]} */
let renderedChunks = [];
let activeWordEl = null;
let activeSentenceEl = null;
let sessionActive = false; // true from Play click until Stop / natural completion / error

// ---------------------------------------------------------------------------
// Status announcements (aria-live region)
// ---------------------------------------------------------------------------

function announce(message) {
  statusRegion.textContent = message;
}

// ---------------------------------------------------------------------------
// Text input: textarea + file upload
// ---------------------------------------------------------------------------

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    textInput.value = String(reader.result || '');
    updateDurationEstimate();
    announce(`Loaded ${file.name}. ${textInput.value.length} characters.`);
  };
  reader.onerror = () => {
    announce(`Could not read ${file.name}. Please try a different .txt file.`);
  };
  reader.readAsText(file);
});

textInput.addEventListener('input', updateDurationEstimate);

// ---------------------------------------------------------------------------
// Reading time estimate
// ---------------------------------------------------------------------------

function updateDurationEstimate() {
  const rate = parseFloat(rateRange.value) || 1;
  const seconds = estimateReadingSeconds(textInput.value, rate);

  if (seconds === 0) {
    durationEstimate.textContent = 'Estimated reading time: —';
    return;
  }

  const minutes = Math.floor(seconds / 60);
  const remSeconds = Math.round(seconds % 60);
  const formatted = minutes > 0 ? `${minutes} min ${remSeconds} sec` : `${remSeconds} sec`;
  durationEstimate.textContent = `Estimated reading time: ${formatted}`;
}

// ---------------------------------------------------------------------------
// Voice list
// ---------------------------------------------------------------------------

function populateVoices() {
  if (!speechSupported) return;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return; // some browsers load voices asynchronously

  const previousValue = voiceSelect.value;
  voiceSelect.innerHTML = '';

  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — default' : ''}`;
    voiceSelect.appendChild(option);
  });

  // Restore prior selection if still valid, otherwise default to the
  // browser's default voice if one is flagged, else the first voice.
  if (previousValue && Number(previousValue) < voices.length) {
    voiceSelect.value = previousValue;
  } else {
    const defaultIndex = voices.findIndex((v) => v.default);
    voiceSelect.value = String(defaultIndex >= 0 ? defaultIndex : 0);
  }

  announce(`${voices.length} voice${voices.length === 1 ? '' : 's'} available.`);
}

if (speechSupported) {
  populateVoices();
  // Voice list is loaded asynchronously in some browsers (notably Chrome).
  window.speechSynthesis.onvoiceschanged = populateVoices;
}

function getSelectedVoice() {
  const voices = window.speechSynthesis.getVoices();
  const index = Number(voiceSelect.value);
  return Number.isInteger(index) && voices[index] ? voices[index] : null;
}

// ---------------------------------------------------------------------------
// Rate slider
// ---------------------------------------------------------------------------

rateRange.addEventListener('input', () => {
  const rate = parseFloat(rateRange.value);
  rateValueOutput.textContent = `${rate.toFixed(1)}x`;
  rateRange.setAttribute('aria-valuenow', String(rate));
  updateDurationEstimate();
});

// ---------------------------------------------------------------------------
// Building the "now reading" view with per-word highlight targets
// ---------------------------------------------------------------------------

function renderReadingView(text) {
  readingOutput.innerHTML = '';
  renderedChunks = [];

  const chunks = splitIntoChunks(text);

  if (chunks.length === 0) {
    readingOutput.appendChild(readingPlaceholder);
    return chunks;
  }

  chunks.forEach((chunkText) => {
    const sentenceEl = document.createElement('span');
    sentenceEl.className = 'current-sentence-target';

    const boundaries = getWordBoundaries(chunkText);
    const wordEls = [];

    let cursor = 0;
    boundaries.forEach((b) => {
      // Preserve original inter-word whitespace as a text node.
      if (b.start > cursor) {
        sentenceEl.appendChild(document.createTextNode(chunkText.slice(cursor, b.start)));
      }
      const wordEl = document.createElement('span');
      wordEl.className = 'word';
      wordEl.textContent = b.word;
      sentenceEl.appendChild(wordEl);
      wordEls.push(wordEl);
      cursor = b.end;
    });
    if (cursor < chunkText.length) {
      sentenceEl.appendChild(document.createTextNode(chunkText.slice(cursor)));
    }

    sentenceEl.appendChild(document.createTextNode(' '));

    readingOutput.appendChild(sentenceEl);
    renderedChunks.push({ chunkEl: sentenceEl, wordEls, boundaries });
  });

  return chunks;
}

function clearHighlight() {
  if (activeWordEl) {
    activeWordEl.classList.remove('current-word');
    activeWordEl = null;
  }
  if (activeSentenceEl) {
    activeSentenceEl.classList.remove('current-sentence');
    activeSentenceEl = null;
  }
}

function highlightSentence(chunkIndex) {
  clearHighlight();
  const entry = renderedChunks[chunkIndex];
  if (!entry) return;
  entry.chunkEl.classList.add('current-sentence');
  activeSentenceEl = entry.chunkEl;
  entry.chunkEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function highlightWord(chunkIndex, charIndex) {
  const entry = renderedChunks[chunkIndex];
  if (!entry) return;

  const wordIndex = findWordAtIndex(entry.boundaries, charIndex);
  if (wordIndex < 0) return;

  if (activeWordEl) activeWordEl.classList.remove('current-word');
  activeWordEl = entry.wordEls[wordIndex];
  if (activeWordEl) {
    activeWordEl.classList.add('current-word');
    activeWordEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ---------------------------------------------------------------------------
// Playback control (drives window.speechSynthesis directly)
// ---------------------------------------------------------------------------

function setButtonStates({ playing, paused }) {
  playBtn.disabled = playing || paused;
  pauseBtn.disabled = !playing;
  resumeBtn.disabled = !paused;
  stopBtn.disabled = !playing && !paused;
}

function buildUtterance(chunkText, chunkIndex, isLast) {
  const utterance = new SpeechSynthesisUtterance(chunkText);
  utterance.rate = parseFloat(rateRange.value) || 1;

  const voice = getSelectedVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    highlightSentence(chunkIndex);
  };

  utterance.onboundary = (event) => {
    if (event.name && event.name !== 'word') return; // some engines emit 'sentence' too
    highlightWord(chunkIndex, event.charIndex);
  };

  utterance.onend = () => {
    if (isLast) {
      sessionActive = false;
      clearHighlight();
      setButtonStates({ playing: false, paused: false });
      announce('Finished reading.');
    }
  };

  utterance.onerror = (event) => {
    sessionActive = false;
    setButtonStates({ playing: false, paused: false });
    announce(`Playback error: ${event.error || 'unknown error'}.`);
  };

  return utterance;
}

function startPlayback() {
  if (!speechSupported) return;

  const text = textInput.value;
  const chunks = renderReadingView(text);

  if (chunks.length === 0) {
    announce('Please enter or load some text before pressing play.');
    return;
  }

  // Cancel anything already queued/speaking before starting a fresh session.
  window.speechSynthesis.cancel();

  chunks.forEach((chunkText, index) => {
    const utterance = buildUtterance(chunkText, index, index === chunks.length - 1);
    window.speechSynthesis.speak(utterance);
  });

  sessionActive = true;
  setButtonStates({ playing: true, paused: false });
  announce('Playing.');
}

function pausePlayback() {
  if (!speechSupported || !sessionActive) return;
  window.speechSynthesis.pause();
  setButtonStates({ playing: false, paused: true });
  announce('Paused.');
}

function resumePlayback() {
  if (!speechSupported || !sessionActive) return;
  window.speechSynthesis.resume();
  setButtonStates({ playing: true, paused: false });
  announce('Resumed.');
}

function stopPlayback() {
  if (!speechSupported) return;
  window.speechSynthesis.cancel();
  sessionActive = false;
  clearHighlight();
  setButtonStates({ playing: false, paused: false });
  announce('Stopped.');
}

playBtn.addEventListener('click', startPlayback);
pauseBtn.addEventListener('click', pausePlayback);
resumeBtn.addEventListener('click', resumePlayback);
stopBtn.addEventListener('click', stopPlayback);

// ---------------------------------------------------------------------------
// Keyboard shortcuts: Alt+P play/pause toggle, Alt+S stop
// ---------------------------------------------------------------------------

document.addEventListener('keydown', (event) => {
  if (!event.altKey) return;

  if (event.key.toLowerCase() === 'p') {
    event.preventDefault();
    if (pauseBtn.disabled === false) {
      pausePlayback();
    } else if (resumeBtn.disabled === false) {
      resumePlayback();
    } else {
      startPlayback();
    }
  } else if (event.key.toLowerCase() === 's') {
    event.preventDefault();
    stopPlayback();
  }
});

// ---------------------------------------------------------------------------
// Font size control
// ---------------------------------------------------------------------------

fontSizeRange.addEventListener('input', () => {
  const size = fontSizeRange.value;
  document.documentElement.style.setProperty('--user-font-size', `${size}px`);
  fontSizeValue.textContent = `${size}px`;
  fontSizeRange.setAttribute('aria-valuenow', size);
});

// ---------------------------------------------------------------------------
// High-contrast theme toggle
// ---------------------------------------------------------------------------

contrastToggle.addEventListener('click', () => {
  const isHighContrast = document.documentElement.getAttribute('data-theme') === 'high-contrast';
  const next = !isHighContrast;

  document.documentElement.setAttribute('data-theme', next ? 'high-contrast' : 'default');
  contrastToggle.setAttribute('aria-pressed', String(next));
  contrastState.textContent = next ? 'On' : 'Off';
  announce(`High contrast theme turned ${next ? 'on' : 'off'}.`);
});

// ---------------------------------------------------------------------------
// Initial setup
// ---------------------------------------------------------------------------

updateDurationEstimate();
