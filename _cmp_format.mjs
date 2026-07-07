import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import { buildWorkbook } from './_exporttest.mjs';

const TEMPLATE = '/Users/ghala/Downloads/attachments/Copy of Source_to_Target_Fact_Dimension_Mapping_Template.xlsx';

function dump(wb, label) {
  console.log(`\n==================== ${label} ====================`);
  console.log('SHEETS (' + wb.SheetNames.length + '): ' + wb.SheetNames.join(' · '));
  wb.SheetNames.forEach((nm) => {
    const grid = XLSX.utils.sheet_to_json(wb.Sheets[nm], { header: 1, blankrows: false });
    const header = (grid[0] || []).map((c) => String(c ?? '').trim());
    console.log(`\n  �sheet: ${nm}  (rows=${grid.length})`);
    console.log('    header: ' + JSON.stringify(header));
  });
  return wb;
}

// 1) template
const tpl = XLSX.read(readFileSync(TEMPLATE), { type: 'buffer' });
dump(tpl, 'TEMPLATE (your manual file)');

// 2) app output on a real cached model
const result = JSON.parse(readFileSync('/tmp/models/R02.json', 'utf8'));
const app = buildWorkbook([{ fileName: 'R02.sql', content: '', result }]);
dump(app, 'APP OUTPUT (buildWorkbook on R02)');

// 3) compare sheet names + headers
console.log('\n==================== COMPARISON ====================');
const tNames = tpl.SheetNames, aNames = app.SheetNames;
console.log('sheet-name match: ' + (JSON.stringify(tNames) === JSON.stringify(aNames) ? 'IDENTICAL ✅' : 'DIFFERENT ❌'));
tNames.forEach((nm) => {
  const th = (XLSX.utils.sheet_to_json(tpl.Sheets[nm] || {}, { header: 1 })[0] || []).map((c)=>String(c??'').trim());
  const aws = app.Sheets[nm];
  const ah = aws ? (XLSX.utils.sheet_to_json(aws, { header: 1 })[0] || []).map((c)=>String(c??'').trim()) : null;
  const same = ah && JSON.stringify(th) === JSON.stringify(ah);
  console.log(`  ${nm}: ${same ? 'headers IDENTICAL ✅' : 'DIFF ❌'}`);
  if (!same && ah) { console.log('     tpl: ' + JSON.stringify(th)); console.log('     app: ' + JSON.stringify(ah)); }
});
