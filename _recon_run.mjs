/* TEMP offline reconciliation test (deleted after run).
   Builds the test module FROM the real src/utils/claudeApi.js so it can
   never drift from the source, then replays reconcileCaseAnalysis over the
   18 cached raw models and reports the completeness verdict before/after. */
import { readFileSync, writeFileSync } from 'node:fs';

// Transform the real source into a Node-importable module (only import.meta.env
// is browser-specific; analyzeQuery/fetch are never invoked at import time).
const src = readFileSync('./src/utils/claudeApi.js', 'utf8').replaceAll('import.meta.env', 'process.env');
writeFileSync('./_recontest.mjs', src);
const { reconcileCaseAnalysis } = await import('./_recontest.mjs');

const hasCase = (s) => /\bcase\b|\biif\b/i.test(String(s || ''));
function capturedCount(m) {
  let n = 0;
  (m.dimensions || []).forEach((d) => (d.column_mappings || []).forEach((c) => { if (hasCase(c.transformation)) n++; }));
  (m.facts || []).forEach((f) => (f.base_measures || []).forEach((x) => { if (hasCase(x.transformation)) n++; }));
  (m.facts || []).forEach((f) => (f.derived_measures || []).forEach((x) => { if (hasCase(x.formula)) n++; }));
  return n;
}
function verdict(m) {
  const ca = Array.isArray(m.case_analysis) ? m.case_analysis : [];
  const should = ca.filter((e) => /measure|classification/i.test(e.role || ''));
  const notModeled = should.filter((e) => /not modeled/i.test(e.placed_in || ''));
  const captured = capturedCount(m);
  const complete = should.length === 0 ? true : captured >= should.length && notModeled.length === 0;
  return { should: should.length, captured, complete };
}

const ids = ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13','R14','R15','R16','R17','R18'];
let before = 0, after = 0;
console.log('id  | should | cap(before) | cap(after) | before | after');
for (const id of ids) {
  const raw = JSON.parse(readFileSync('/tmp/models/' + id + '.json', 'utf8'));
  const vB = verdict(JSON.parse(JSON.stringify(raw)));
  const m = reconcileCaseAnalysis(JSON.parse(JSON.stringify(raw)));
  const vA = verdict(m);
  if (vB.complete) before++;
  if (vA.complete) after++;
  const flag = vB.complete === vA.complete ? (vA.complete ? '' : ' STILL-INCOMPLETE') : ' FIXED';
  console.log(`${id} |   ${String(vB.should).padStart(2)}   |     ${String(vB.captured).padStart(2)}      |     ${String(vA.captured).padStart(2)}     |  ${vB.complete?'YES':'no '}   | ${vA.complete?'YES':'no '}${flag}`);
}
console.log(`\nCASE-complete: before=${before}/18  after=${after}/18`);
