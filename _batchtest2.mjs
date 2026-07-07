/* TEMP batch test v2 (deleted after run) — case_analysis-aware. */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const apiSrc = readFileSync('./src/utils/claudeApi.js', 'utf8')
  .replaceAll('import.meta.env', 'process.env')
  .replace("fetch('/api/groq'", "fetch('https://api.groq.com/openai/v1/chat/completions'")
  .replace(
    "    headers: {\n      'Content-Type': 'application/json',\n    },",
    "    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY) },",
  );
writeFileSync('./_apitest.mjs', apiSrc);
const { analyzeQuery } = await import('./_apitest.mjs');

const DIR = '/Users/ghala/Downloads/Report_Queries';
const OUT = '/tmp/models';
mkdirSync(OUT, { recursive: true });
const files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.sql'))
  .sort((a, b) => parseInt((a.match(/^R(\d+)/) || [])[1] || 0) - parseInt((b.match(/^R(\d+)/) || [])[1] || 0));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const countCase = (s) => ((String(s).match(/\bcase\s+when\b/gi) || []).length + (String(s).match(/\biif\s*\(/gi) || []).length);
const hasCase = (s) => /\bcase\b|\biif\b/i.test(String(s || ''));

function capturedCount(m) {
  let n = 0;
  (m.dimensions || []).forEach((d) => (d.column_mappings || []).forEach((c) => { if (hasCase(c.transformation)) n++; }));
  (m.facts || []).forEach((f) => (f.base_measures || []).forEach((x) => { if (hasCase(x.transformation)) n++; }));
  (m.facts || []).forEach((f) => (f.derived_measures || []).forEach((x) => { if (hasCase(x.formula)) n++; }));
  return n;
}
function checkReport(sql, m) {
  const sqlCase = countCase(sql);
  const ca = Array.isArray(m.case_analysis) ? m.case_analysis : [];
  const should = ca.filter((e) => /measure|classification/i.test(e.role || ''));
  const notModeledButShould = should.filter((e) => /not modeled/i.test(e.placed_in || ''));
  const captured = capturedCount(m);
  const caseComplete = should.length === 0
    ? true
    : captured >= should.length && notModeledButShould.length === 0;
  const caUnderListed = sqlCase > 0 && ca.length === 0;
  return {
    sqlCase, ca: ca.length, should: should.length, other: ca.length - should.length,
    captured, notModeled: notModeledButShould.length, caseComplete, caUnderListed,
    facts: (m.facts || []).length, dims: (m.dimensions || []).length,
    hasDimDate: (m.dimensions || []).some((d) => /dim_date/i.test(d.name)),
  };
}
async function withRetry(sql, name) {
  let last;
  for (let a = 1; a <= 6; a++) {
    try { return await analyzeQuery(sql, name, ''); }
    catch (e) { last = e; const w = /429|rate/i.test(String(e.message)) ? 25000 : 4000 * a; if (a < 6) { console.log('   retry ' + a + ' in ' + w / 1000 + 's'); await sleep(w); } }
  }
  throw last;
}

const rows = [];
console.log('Testing ' + files.length + ' reports (case_analysis-aware)\n');
for (const f of files) {
  const id = (f.match(/^R\d+/) || ['?'])[0];
  const sql = readFileSync(DIR + '/' + f, 'utf8');
  const p = OUT + '/' + id + '.json';
  let m;
  if (existsSync(p)) { m = JSON.parse(readFileSync(p, 'utf8')); process.stdout.write(id + ' (cached) '); }
  else {
    process.stdout.write(id + ' … ');
    try { m = await withRetry(sql, f); writeFileSync(p, JSON.stringify(m, null, 2)); }
    catch (e) { console.log('💥 ' + String(e.message).slice(0, 120)); rows.push({ id, error: 1 }); continue; }
    await sleep(2000);
  }
  const c = checkReport(sql, m);
  rows.push({ id, ...c });
  console.log(`${c.caseComplete ? '✅ COMPLETE' : '⚠ PARTIAL '} | sqlCASE=${c.sqlCase} listed=${c.ca} should=${c.should} captured=${c.captured} notModeled=${c.notModeled}${c.caUnderListed ? ' ‼CASE-not-listed' : ''}`);
}
const complete = rows.filter((r) => r.caseComplete).length;
console.log('\n================ SUMMARY ================');
console.log(`CASE-complete: ${complete}/${files.length}`);
console.log('id  | sqlCASE | listed | should | captured | complete');
rows.forEach((r) => {
  if (r.error) return console.log(`${r.id}  ERROR`);
  console.log(`${r.id} |   ${String(r.sqlCase).padStart(3)}   |   ${String(r.ca).padStart(2)}   |   ${String(r.should).padStart(2)}   |    ${String(r.captured).padStart(2)}    | ${r.caseComplete ? 'YES' : 'no'}`);
});
writeFileSync('/tmp/batch2_summary.json', JSON.stringify(rows, null, 2));
console.log('\nDONE.');
