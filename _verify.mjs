/* TEMP verify helper — deleted after run. Prints EXACTLY what the tool saw:
   the extracted Cloudera SQL + the context metadata, plus the raw
   Filters / Sample_Mapping / Notes / Tables sheets, so we can judge
   whether a missing element is a tool-miss or genuinely absent (N/A). */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
writeFileSync('./_intaketest.mjs', readFileSync('./src/utils/fileIntake.js', 'utf8').replace("import * as XLSX from 'xlsx';", "import { createRequire as _cr } from 'node:module';\nconst XLSX = _cr(import.meta.url)('xlsx');"));
const { extractReportFromWorkbook } = await import('./_intaketest.mjs');

const DIR = '/Users/ghala/Downloads/To be migrated reports';
const needle = process.argv[2] || 'Report_01';
const fn = readdirSync(DIR).find((f) => f.includes(needle) && f.toLowerCase().endsWith('.xlsx'));
if (!fn) { console.error('No file matching', needle); process.exit(1); }
const buf = readFileSync(DIR + '/' + fn);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const { sql, context } = extractReportFromWorkbook(ab);

console.log('FILE:', fn);
console.log('\n########## EXTRACTED SQL (what the tool actually parsed) ##########\n');
console.log(sql || '(empty)');
console.log('\n########## EXTRACTED CONTEXT (metadata passed to the model) ##########\n');
console.log(context || '(empty)');

const wb = XLSX.read(ab, { type: 'array' });
console.log('\n########## ALL SHEET NAMES ##########\n' + wb.SheetNames.join(' | '));
for (const name of ['Filters', 'Sample_Mapping', 'Notes', 'Tables', 'Columns']) {
  if (!wb.SheetNames.includes(name)) continue;
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
  console.log(`\n########## SHEET: ${name} (${rows.length} rows) ##########`);
  rows.forEach((r, i) => console.log(String(i).padStart(3) + ': ' + r.map((c) => String(c).replace(/\n/g, ' / ')).join(' | ')));
}
