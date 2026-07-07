/* TEMP Round-1 (harness) builder — deleted after run.
   Full pipeline on the 18 cached raw models: reconcile → verdict + quality →
   save reconciled models → build the combined 8-sheet Excel. Modules are
   transformed FROM the real source so they can't drift. */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// Build importable copies of the real source modules.
writeFileSync('./_recontest.mjs', readFileSync('./src/utils/claudeApi.js', 'utf8').replaceAll('import.meta.env', 'process.env'));
writeFileSync('./_exporttest.mjs', readFileSync('./src/utils/exportUtils.js', 'utf8').replace("import * as XLSX from 'xlsx';", "import { createRequire as _cr } from 'node:module';\nconst XLSX = _cr(import.meta.url)('xlsx');"));
const { reconcileCaseAnalysis } = await import('./_recontest.mjs');
const { buildWorkbook } = await import('./_exporttest.mjs');

// calculateQuality is module-internal in claudeApi.js — replicate verbatim.
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

mkdirSync('/tmp/round1', { recursive: true });
const ids = Array.from({ length: 18 }, (_, i) => 'R' + String(i + 1).padStart(2, '0'));
const results = [];
const summary = [];
console.log('id  | facts | dims | DIM_DATE | should | captured | complete | quality');
for (const id of ids) {
  const raw = JSON.parse(readFileSync('/tmp/models/' + id + '.json', 'utf8'));
  const { fileName, content } = sqlFor(id);
  const model = reconcileCaseAnalysis(JSON.parse(JSON.stringify(raw)), content);
  const q = calculateQuality(model);
  model.quality_score = q;
  const v = verdict(model);
  writeFileSync('/tmp/round1/' + id + '.json', JSON.stringify(model, null, 2));
  results.push({ fileName, content, result: model });
  const row = {
    id, facts: (model.facts || []).length, dims: (model.dimensions || []).length,
    dimDate: (model.dimensions || []).some((d) => /dim_date/i.test(d.name)),
    should: v.should, captured: v.captured, complete: v.complete, quality: q,
  };
  summary.push(row);
  console.log(`${id} |   ${String(row.facts).padStart(2)}  |  ${String(row.dims).padStart(2)}  |   ${row.dimDate ? 'yes' : 'NO '}    |   ${String(row.should).padStart(2)}   |    ${String(row.captured).padStart(2)}    |   ${row.complete ? 'YES' : 'no '}    |  ${q}%`);
}
writeFileSync('/tmp/round1_summary.json', JSON.stringify(summary, null, 2));

// Combined 8-sheet Excel from all 18 (the deliverable format).
const wb = buildWorkbook(results);
XLSX.writeFile(wb, '/tmp/Round1_AllReports.xlsx');

const complete = summary.filter((r) => r.complete).length;
const avgQ = Math.round(summary.reduce((a, r) => a + r.quality, 0) / summary.length);
console.log(`\nRound 1 (harness): CASE-complete ${complete}/18 · avg quality ${avgQ}% · Excel → /tmp/Round1_AllReports.xlsx`);
