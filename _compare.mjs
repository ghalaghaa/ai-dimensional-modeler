/* TEMP two-round comparison (deleted after run).
   Diffs Round 1 (harness) vs Round 2 (website) per-report verdicts and prints
   a side-by-side table. Parity is judged on VERDICTS (CASE-complete, DIM_DATE
   present) — not byte-identical structure, since Groq varies run to run. */
import { readFileSync } from 'node:fs';
const r1 = JSON.parse(readFileSync('/tmp/round1_summary.json', 'utf8'));
const r2 = JSON.parse(readFileSync('/tmp/round2_summary.json', 'utf8'));
const by = (arr) => Object.fromEntries(arr.map((r) => [r.id, r]));
const A = by(r1), B = by(r2);
const ids = Array.from(new Set([...r1.map((r) => r.id), ...r2.map((r) => r.id)])).sort();

console.log('id  | R1 f/d  DIM_DATE complete Q | R2 f/d  DIM_DATE complete Q | match');
let bothComplete = 0, dimDateParity = 0, completeParity = 0;
for (const id of ids) {
  const a = A[id], b = B[id];
  if (!a || !b) { console.log(`${id} | ${a ? 'R1 only' : 'R2 only'}`); continue; }
  const cMatch = a.complete === b.complete;
  const dMatch = a.dimDate === b.dimDate;
  if (a.complete && b.complete) bothComplete++;
  if (dMatch) dimDateParity++;
  if (cMatch) completeParity++;
  const line = `${id} | ${a.facts}/${String(a.dims).padStart(2)}    ${a.dimDate ? 'yes' : 'NO '}     ${a.complete ? 'YES' : 'no '}   ${String(a.quality).padStart(3)} `
    + `| ${b.facts}/${String(b.dims).padStart(2)}    ${b.dimDate ? 'yes' : 'NO '}     ${b.complete ? 'YES' : 'no '}   ${String(b.quality).padStart(3)} `
    + `| ${cMatch && dMatch ? 'OK' : '⚠ ' + (cMatch ? '' : 'complete≠ ') + (dMatch ? '' : 'dimDate≠')}`;
  console.log(line);
}
console.log('\n================ PARITY SUMMARY ================');
console.log(`Reports compared      : ${ids.length}`);
console.log(`Both rounds COMPLETE  : ${bothComplete}/${ids.length}`);
console.log(`CASE-complete parity  : ${completeParity}/${ids.length}`);
console.log(`DIM_DATE parity       : ${dimDateParity}/${ids.length}`);
const r1complete = r1.filter((r) => r.complete).length;
const r2complete = r2.filter((r) => r.complete).length;
console.log(`Round 1 complete: ${r1complete}/${r1.length} · Round 2 complete: ${r2complete}/${r2.length}`);
