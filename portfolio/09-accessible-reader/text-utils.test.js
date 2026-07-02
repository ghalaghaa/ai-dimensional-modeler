import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitIntoChunks,
  countWords,
  estimateReadingSeconds,
  getWordBoundaries,
  findWordAtIndex,
} from './text-utils.js';

describe('splitIntoChunks', () => {
  test('empty string returns empty array', () => {
    assert.deepEqual(splitIntoChunks(''), []);
  });

  test('whitespace-only string returns empty array', () => {
    assert.deepEqual(splitIntoChunks('   \n\t  '), []);
  });

  test('non-string input returns empty array', () => {
    assert.deepEqual(splitIntoChunks(null), []);
    assert.deepEqual(splitIntoChunks(undefined), []);
    assert.deepEqual(splitIntoChunks(42), []);
  });

  test('a single long sentence with no punctuation is returned as one chunk', () => {
    const text =
      'this is a very long sentence with no terminal punctuation at all just words going on and on';
    const result = splitIntoChunks(text);
    assert.equal(result.length, 1);
    assert.equal(result[0], text);
  });

  test('multiple sentences with mixed punctuation are split correctly', () => {
    const text = 'Is this working? Yes it is! Great, thanks.';
    const result = splitIntoChunks(text);
    assert.deepEqual(result, ['Is this working?', 'Yes it is!', 'Great, thanks.']);
  });

  test('text containing newlines is split on line boundaries too', () => {
    const text = 'First line without punctuation\nSecond line here\n\nThird line.';
    const result = splitIntoChunks(text);
    assert.deepEqual(result, [
      'First line without punctuation',
      'Second line here',
      'Third line.',
    ]);
  });

  test('collapses internal whitespace within a chunk', () => {
    const text = 'Too    many     spaces   here.';
    const result = splitIntoChunks(text);
    assert.deepEqual(result, ['Too many spaces here.']);
  });

  test('handles ellipsis and trailing quotes/parens gracefully', () => {
    const text = 'Wait... what? She said "really?" and left.';
    const result = splitIntoChunks(text);
    assert.ok(result.length >= 2);
    assert.ok(result.every((c) => c.length > 0));
  });

  test('CRLF line endings are normalized like plain newlines', () => {
    const text = 'Line one\r\nLine two.';
    const result = splitIntoChunks(text);
    assert.deepEqual(result, ['Line one', 'Line two.']);
  });
});

describe('countWords', () => {
  test('empty string is zero words', () => {
    assert.equal(countWords(''), 0);
  });

  test('whitespace-only string is zero words', () => {
    assert.equal(countWords('   \n\t '), 0);
  });

  test('non-string input is zero words', () => {
    assert.equal(countWords(null), 0);
    assert.equal(countWords(undefined), 0);
  });

  test('counts words separated by varied whitespace', () => {
    assert.equal(countWords('hello   world\nfoo\tbar'), 4);
  });

  test('single word has count one', () => {
    assert.equal(countWords('  hello  '), 1);
  });
});

describe('getWordBoundaries', () => {
  test('empty string returns empty array', () => {
    assert.deepEqual(getWordBoundaries(''), []);
  });

  test('non-string input returns empty array', () => {
    assert.deepEqual(getWordBoundaries(null), []);
    assert.deepEqual(getWordBoundaries(undefined), []);
  });

  test('computes correct start/end offsets for simple text', () => {
    const result = getWordBoundaries('Hi there');
    assert.deepEqual(result, [
      { word: 'Hi', start: 0, end: 2 },
      { word: 'there', start: 3, end: 8 },
    ]);
  });

  test('handles multiple spaces and newlines between words', () => {
    const result = getWordBoundaries('one   two\nthree');
    assert.deepEqual(result, [
      { word: 'one', start: 0, end: 3 },
      { word: 'two', start: 6, end: 9 },
      { word: 'three', start: 10, end: 15 },
    ]);
  });
});

describe('findWordAtIndex', () => {
  const boundaries = getWordBoundaries('Hi there friend');
  // "Hi" 0-2, "there" 3-8, "friend" 9-15

  test('returns -1 for empty boundaries', () => {
    assert.equal(findWordAtIndex([], 0), -1);
  });

  test('returns -1 for invalid charIndex', () => {
    assert.equal(findWordAtIndex(boundaries, -1), -1);
    assert.equal(findWordAtIndex(boundaries, NaN), -1);
    assert.equal(findWordAtIndex(boundaries, 'x'), -1);
  });

  test('finds the word exactly containing the charIndex', () => {
    assert.equal(findWordAtIndex(boundaries, 0), 0); // "Hi"
    assert.equal(findWordAtIndex(boundaries, 4), 1); // "there"
    assert.equal(findWordAtIndex(boundaries, 9), 2); // "friend"
    assert.equal(findWordAtIndex(boundaries, 14), 2); // "friend"
  });

  test('falls back to nearest preceding word when charIndex is in whitespace', () => {
    assert.equal(findWordAtIndex(boundaries, 2), 0); // space right after "Hi"
    assert.equal(findWordAtIndex(boundaries, 8), 1); // space right after "there"
  });

  test('charIndex past the end of text falls back to last word', () => {
    assert.equal(findWordAtIndex(boundaries, 999), 2);
  });
});

describe('estimateReadingSeconds', () => {
  test('empty text takes zero seconds', () => {
    assert.equal(estimateReadingSeconds(''), 0);
  });

  test('estimates duration at default rate and baseline wpm', () => {
    // 150 words at 150 wpm baseline, rate 1 => 1 minute => 60 seconds
    const words = new Array(150).fill('word').join(' ');
    assert.equal(estimateReadingSeconds(words, 1, 150), 60);
  });

  test('doubling the rate halves the duration', () => {
    const words = new Array(150).fill('word').join(' ');
    const normal = estimateReadingSeconds(words, 1, 150);
    const fast = estimateReadingSeconds(words, 2, 150);
    assert.equal(fast, normal / 2);
  });

  test('rate is clamped to the Web Speech API valid range', () => {
    const words = new Array(150).fill('word').join(' ');
    const tooFast = estimateReadingSeconds(words, 999, 150);
    const clampedAt10 = estimateReadingSeconds(words, 10, 150);
    assert.equal(tooFast, clampedAt10);

    const tooSlow = estimateReadingSeconds(words, -5, 150);
    const clampedAt01 = estimateReadingSeconds(words, 0.1, 150);
    assert.equal(tooSlow, clampedAt01);
  });

  test('invalid rate falls back to 1', () => {
    const words = new Array(150).fill('word').join(' ');
    const withNaN = estimateReadingSeconds(words, NaN, 150);
    const withDefault = estimateReadingSeconds(words, 1, 150);
    assert.equal(withNaN, withDefault);
  });

  test('non-positive baseline wpm falls back to default 150', () => {
    const words = new Array(150).fill('word').join(' ');
    const withZeroBaseline = estimateReadingSeconds(words, 1, 0);
    const withDefaultBaseline = estimateReadingSeconds(words, 1, 150);
    assert.equal(withZeroBaseline, withDefaultBaseline);
  });
});
