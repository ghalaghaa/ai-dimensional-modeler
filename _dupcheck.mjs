/* TEMP duplicate-bloat scanner (deleted after run).
   After reconciliation, checks every fact/dimension for (a) duplicate member
   NAMES and (b) duplicate canonical CASE signatures — the two symptoms of
   over-injection we hardened against. Uses the freshly-built _recontest.mjs. */
import { readFileSync } from 'node:fs';
import { reconcileCaseAnalysis } from './_recontest.mjs';

const canon = (s) => {
  let e = String(s ?? '');
  const i = e.search(/\bcase\b|\biif\b/i);
  if (i >= 0) e = e.slice(i);
  return e.replace(/\b(count|sum|avg|min|max)\s*\(\s*distinct\b/gi, '$1(')
    .replace(/\bdistinct\b/gi, '').replace(/\b[A-Za-z_]\w*\s*\.\s*/g, '')
    .replace(/[^a-z0-9]/gi, '').toLowerCase();
};
const hasCase = (s) => /\bcase\b|\biif\b/i.test(String(s || ''));

const ids = ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13','R14','R15','R16','R17','R18'];
let totalIssues = 0;
for (const id of ids) {
  const raw = JSON.parse(readFileSync('/tmp/models/' + id + '.json', 'utf8'));
  const m = reconcileCaseAnalysis(JSON.parse(JSON.stringify(raw)));
  const issues = [];

  const scan = (label, items, nameOf, exprOf) => {
    const names = new Map();
    const sigs = new Map();
    items.forEach((x) => {
      const nm = String(nameOf(x) || '').toLowerCase();
      names.set(nm, (names.get(nm) || 0) + 1);
      if (hasCase(exprOf(x))) {
        const c = canon(exprOf(x));
        if (c) sigs.set(c, (sigs.get(c) || 0) + 1);
      }
    });
    names.forEach((n, k) => { if (n > 1) issues.push(`${label}: duplicate NAME "${k}" ×${n}`); });
    sigs.forEach((n, k) => { if (n > 1) issues.push(`${label}: duplicate CASE-sig ×${n} (${k.slice(0, 40)}…)`); });
  };

  (m.facts || []).forEach((f) => {
    scan(`${f.name}.base_measures`, f.base_measures || [], (x) => x.name, (x) => x.transformation);
    scan(`${f.name}.derived_measures`, f.derived_measures || [], (x) => x.name, (x) => x.formula);
  });
  (m.dimensions || []).forEach((d) => {
    scan(`${d.name}.column_mappings`, d.column_mappings || [], (x) => x.target_column, (x) => x.transformation);
  });

  if (issues.length) {
    totalIssues += issues.length;
    console.log(`${id}  ⚠ ${issues.length} issue(s):`);
    issues.forEach((i) => console.log('     ' + i));
  } else {
    console.log(`${id}  clean`);
  }
}
console.log(`\nTOTAL duplicate/bloat issues across 18 reports: ${totalIssues}`);
