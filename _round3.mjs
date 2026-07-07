/* TEMP Round-3 (website, xlsx report inputs) harness — deleted after run.
   Mirrors the site EXACTLY: extractReportFromWorkbook (SQL + context) →
   analyzeQuery(sql, fileName, context) → reconcileCaseAnalysis → model;
   buildWorkbook for the combined deliverable. fetch('/api/groq') is
   redirected straight to Groq (the dev proxy is only a pass-through, so the
   output is identical). Modules are transformed FROM real source so they
   can't drift. Optional arg = number of reports to process (default all). */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// --- GROQ key from .env (never logged) ---
const envTxt = readFileSync('./.env', 'utf8');
const km = envTxt.match(/^\s*VITE_GROQ_API_KEY\s*=\s*(.+?)\s*$/m);
const KEY = km ? km[1].trim().replace(/^["']|["']$/g, '') : '';
if (!KEY) { console.error('No VITE_GROQ_API_KEY in .env'); process.exit(1); }

// --- redirect /api/groq → Groq real endpoint (proxy is a pass-through) ---
const realFetch = globalThis.fetch;
globalThis.fetch = (url, opts = {}) => {
  if (String(url).includes('/api/groq')) {
    return realFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: opts.body,
    });
  }
  return realFetch(url, opts);
};

// --- import the REAL modules (transformed from source) ---
writeFileSync('./_intaketest.mjs', readFileSync('./src/utils/fileIntake.js', 'utf8').replace("import * as XLSX from 'xlsx';", "import { createRequire as _cr } from 'node:module';\nconst XLSX = _cr(import.meta.url)('xlsx');"));
writeFileSync('./_apitest.mjs', readFileSync('./src/utils/claudeApi.js', 'utf8').replaceAll('import.meta.env', 'process.env'));
writeFileSync('./_exporttest.mjs', readFileSync('./src/utils/exportUtils.js', 'utf8').replace("import * as XLSX from 'xlsx';", "import { createRequire as _cr } from 'node:module';\nconst XLSX = _cr(import.meta.url)('xlsx');"));
const { extractReportFromWorkbook } = await import('./_intaketest.mjs');
const { analyzeQuery } = await import('./_apitest.mjs');
const { buildWorkbook } = await import('./_exporttest.mjs');

const DIR = '/Users/ghala/Downloads/To be migrated reports';
const files = readdirSync(DIR).filter((f) => /^Report_\d{2}_.*\.xlsx$/i.test(f)).sort();
const LIMIT = process.argv[2] ? Number(process.argv[2]) : files.length;

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

mkdirSync('/tmp/round3', { recursive: true });
const N = Math.min(LIMIT, files.length);
const results = [], summary = [];
console.log(`Processing ${N} report(s)…\n`);
for (let i = 0; i < N; i++) {
  const fn = files[i];
  const id = 'R' + fn.match(/^Report_(\d{2})/)[1];
  const buf = readFileSync(DIR + '/' + fn);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  let sql = '', context = '';
  try { ({ sql, context } = extractReportFromWorkbook(ab)); }
  catch (e) { console.log(`${id} EXTRACT FAIL: ${e.message}`); continue; }
  if (!sql) { console.log(`${id} NO SQL EXTRACTED (sheets: n/a)`); continue; }
  let model;
  try { model = await analyzeQuery(sql, fn, context); }
  catch (e) { console.log(`${id} ANALYZE FAIL: ${e.message}`); continue; }
  writeFileSync(`/tmp/round3/${id}.json`, JSON.stringify(model, null, 2));
  results.push({ fileName: fn, content: sql, result: model });
  const v = verdict(model);
  const dims = model.dimensions || [];
  const row = {
    id, report_name: model.report_name || '',
    sqlLen: sql.length, ctxLen: context.length,
    facts: (model.facts || []).length,
    dims: dims.length,
    dimNames: dims.map((d) => d.name).join(','),
    sources: (model.source_tables || []).length,
    sourceNames: (model.source_tables || []).map((s) => (typeof s === 'string' ? s : s.name || s.table || JSON.stringify(s))).join(','),
    baseMeas: (model.facts || []).reduce((a, f) => a + (f.base_measures || []).length, 0),
    derMeas: (model.facts || []).reduce((a, f) => a + (f.derived_measures || []).length, 0),
    should: v.should, captured: v.captured, complete: v.complete,
    dimDate: dims.some((d) => /dim_date/i.test(d.name || '')),
    quality: model.quality_score,
  };
  summary.push(row);
  console.log(`${id} | ${row.complete ? 'OK ' : 'INC'} | F${row.facts} D${row.dims} src${row.sources} base${row.baseMeas} der${row.derMeas} | CASE ${row.captured}/${row.should} | DIM_DATE ${row.dimDate ? 'y' : 'N'} | Q${row.quality} | ${row.report_name}`);
}
writeFileSync('/tmp/round3_summary.json', JSON.stringify(summary, null, 2));
if (results.length) {
  const wb = buildWorkbook(results);
  XLSX.writeFile(wb, '/tmp/Round3_AllReports.xlsx');
}
console.log(`\nDone ${results.length}/${N} · complete ${summary.filter((r) => r.complete).length}/${summary.length} · Excel → /tmp/Round3_AllReports.xlsx`);
