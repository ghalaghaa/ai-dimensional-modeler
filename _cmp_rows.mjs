import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import { buildWorkbook } from './_exporttest.mjs';

const TEMPLATE = '/Users/ghala/Downloads/attachments/Copy of Source_to_Target_Fact_Dimension_Mapping_Template.xlsx';
const tpl = XLSX.read(readFileSync(TEMPLATE), { type: 'buffer' });
const result = JSON.parse(readFileSync('/tmp/models/R02.json', 'utf8'));
const app = buildWorkbook([{ fileName: 'R02.sql', content: '', result }]);

const rows = (wb, nm, n) => XLSX.utils.sheet_to_json(wb.Sheets[nm], { header: 1, blankrows: false }).slice(1, 1 + n)
  .map((r) => (r || []).map((c) => String(c ?? '').slice(0, 22)).join(' | '));

for (const nm of ['Source_To_Target_Map', 'Column_Mapping']) {
  console.log(`\n######### ${nm} — TEMPLATE (first 4 data rows) #########`);
  rows(tpl, nm, 4).forEach((r) => console.log('  ' + r));
  console.log(`######### ${nm} — APP OUTPUT (first 4 data rows) #########`);
  rows(app, nm, 4).forEach((r) => console.log('  ' + r));
}
