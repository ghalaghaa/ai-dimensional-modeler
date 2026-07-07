/* TEMP — print the EXACT {sql, context} the site extracts from a report xlsx. */
import { readFileSync } from 'node:fs';
const { extractReportFromWorkbook } = await import('./_intaketest.mjs');
const buf = readFileSync(process.argv[2]);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const { sql, context } = extractReportFromWorkbook(ab);
console.log(`===== EXTRACTED SQL (${sql.length} chars) =====\n`);
console.log(sql);
console.log(`\n\n===== EXTRACTED CONTEXT (${context.length} chars) =====\n`);
console.log(context);
