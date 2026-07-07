/* TEMP Round-2 (website) artifact builder — deleted after run.
   Reads the 18 models captured from the LIVE site (saved to /tmp/round2/ from
   the browser's localStorage), recomputes verdicts, writes round2_summary.json,
   and builds the combined 8-sheet Excel with the SAME exporter the site uses. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
writeFileSync('./_exporttest.mjs', readFileSync('./src/utils/exportUtils.js', 'utf8').replace("import * as XLSX from 'xlsx';", "import { createRequire as _cr } from 'node:module';\nconst XLSX = _cr(import.meta.url)('xlsx');"));
const { buildWorkbook } = await import('./_exporttest.mjs');

function calculateQuality(m) {
  let s = 0;
  if (m.report_name) s += 10;
  if (m.grain) s += 15;
  if (m.facts?.length > 0) s += 20;
  if (m.dimensions?.length >= 4) s += 20;
  if (m.dimensions?.some((d) => d.name === 'DIM_DATE')) s += 10;
  if (m.source_tables?.length > 0) s += 10;
  if (m.star_schema_validation?.all_dimensions_identified) s += 5;
  if (m.star_schema_validation?.all_measures_identified) s += 5;
  if (m.star_schema_validation?.grain_validated) s += 5;
  return s;
}
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

const SQLDIR = '/Users/ghala/Downloads/Report_Queries';
const sqlFiles = readdirSync(SQLDIR).filter((f) => f.toLowerCase().endsWith('.sql'));
const sqlFor = (id) => {
  const f = sqlFiles.find((n) => n.toUpperCase().startsWith(id));
  return f ? { fileName: f, content: readFileSync(SQLDIR + '/' + f, 'utf8') } : { fileName: id + '.sql', content: '' };
};

const ids = Array.from({ length: 18 }, (_, i) => 'R' + String(i + 1).padStart(2, '0'));
const results = [], summary = [];
console.log('id  | facts | dims | DIM_DATE | should | captured | complete | quality');
for (const id of ids) {
  let model;
  try { model = JSON.parse(readFileSync('/tmp/round2/' + id + '.json', 'utf8')); }
  catch { console.log(`${id} | MISSING`); continue; }
  const q = model.quality_score ?? calculateQuality(model);
  const v = verdict(model);
  const { fileName, content } = sqlFor(id);
  results.push({ fileName, content, result: model });
  const row = { id, facts: (model.facts || []).length, dims: (model.dimensions || []).length,
    dimDate: (model.dimensions || []).some((d) => /dim_date/i.test(d.name)), should: v.should, captured: v.captured, complete: v.complete, quality: q };
  summary.push(row);
  console.log(`${id} |   ${String(row.facts).padStart(2)}  |  ${String(row.dims).padStart(2)}  |   ${row.dimDate ? 'yes' : 'NO '}    |   ${String(row.should).padStart(2)}   |    ${String(row.captured).padStart(2)}    |   ${row.complete ? 'YES' : 'no '}    |  ${q}%`);
}
writeFileSync('/tmp/round2_summary.json', JSON.stringify(summary, null, 2));
const wb = buildWorkbook(results);
XLSX.writeFile(wb, '/tmp/Round2_AllReports.xlsx');
const complete = summary.filter((r) => r.complete).length;
const avgQ = summary.length ? Math.round(summary.reduce((a, r) => a + r.quality, 0) / summary.length) : 0;
console.log(`\nRound 2 (website): CASE-complete ${complete}/${summary.length} · avg quality ${avgQ}% · Excel → /tmp/Round2_AllReports.xlsx`);
