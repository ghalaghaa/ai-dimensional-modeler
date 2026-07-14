import * as XLSX from 'xlsx';

/* ─────────────────────────────────────────────────────────
   File intake — accept .sql files and migrated report .xlsx
   files. Report workbooks carry the migrated Cloudera SQL on a
   "Cloudera_SQL" sheet shaped [Step | Description | SQL], one row
   per query part. We pull the SQL column out and feed it to the
   same analyzer used for raw .sql uploads.
───────────────────────────────────────────────────────── */

const SQL_EXT = /\.sql$/i;
const XLSX_EXT = /\.(xlsx|xls)$/i;
const DTSX_EXT = /\.dtsx$/i;
const CONMGR_EXT = /\.conmgr$/i;

export const ACCEPT = '.sql,.xlsx,.xls,.dtsx,.conmgr';

export function isSupported(name = '') {
  return SQL_EXT.test(name) || XLSX_EXT.test(name) || DTSX_EXT.test(name) || CONMGR_EXT.test(name);
}

const isSqlSheetName = (n = '') => /cloudera[_ ]?sql/i.test(n);

/* Choose the sheet that holds the migrated SQL. */
function pickSqlSheet(wb) {
  return (
    wb.SheetNames.find(isSqlSheetName) ||
    wb.SheetNames.find((n) => /\bsql\b|query/i.test(n)) ||
    wb.SheetNames[0]
  );
}

/* Pull the SQL out of the chosen sheet ([Step | Description | SQL]). */
function sqlFromSheet(ws) {
  if (!ws) return '';
  const grid = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
  if (!grid.length) return '';

  // Locate the SQL / Description / Step columns from a header row.
  let headerRow = -1;
  let sqlCol = -1;
  let descCol = -1;
  let stepCol = -1;
  for (let r = 0; r < Math.min(grid.length, 5); r++) {
    const row = (grid[r] || []).map((c) => String(c ?? '').trim().toLowerCase());
    const idx = row.indexOf('sql');
    if (idx !== -1) {
      headerRow = r;
      sqlCol = idx;
      descCol = row.indexOf('description');
      stepCol = row.indexOf('step');
      break;
    }
  }

  const parts = [];
  if (sqlCol !== -1) {
    for (let r = headerRow + 1; r < grid.length; r++) {
      const row = grid[r] || [];
      const sql = String(row[sqlCol] ?? '').trim();
      if (!sql) continue;
      const step = stepCol !== -1 ? String(row[stepCol] ?? '').trim() : '';
      const desc = descCol !== -1 ? String(row[descCol] ?? '').trim() : '';
      const label = [step && `Step ${step}`, desc].filter(Boolean).join(' — ');
      parts.push(label ? `-- ${label}\n${sql}` : sql);
    }
  }

  // Fallback: no SQL header — grab the largest query-looking cell.
  if (!parts.length) {
    let biggest = '';
    grid.forEach((row) =>
      (row || []).forEach((c) => {
        const s = String(c ?? '');
        if (/\b(select|with)\b/i.test(s) && s.length > biggest.length) biggest = s;
      }),
    );
    if (biggest) parts.push(biggest.trim());
  }

  return parts.join('\n\n').replace(/\r\n?/g, '\n').trim();
}

/* Render one sheet as a compact pipe-delimited text block. */
function sheetToText(ws, maxRows = 50) {
  if (!ws) return '';
  const grid = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
  if (!grid.length) return '';
  const lines = grid
    .slice(0, maxRows)
    .map((row) => (row || []).map((c) => String(c ?? '').replace(/\r?\n/g, ' ').trim()).join(' | ').trim())
    .filter(Boolean);
  let txt = lines.join('\n');
  if (grid.length > maxRows) txt += `\n… (+${grid.length - maxRows} more rows)`;
  return txt.trim();
}

const MAX_CONTEXT = 9000;

/* Every sheet except the SQL sheet, so the model can see the source
   tables, column lineage, filters and existing mapping hints. */
function contextFromWorkbook(wb, sqlSheetName) {
  const blocks = [];
  wb.SheetNames.forEach((nm) => {
    if (nm === sqlSheetName) return;
    const txt = sheetToText(wb.Sheets[nm]);
    if (txt) blocks.push(`### ${nm}\n${txt}`);
  });
  let ctx = blocks.join('\n\n');
  if (ctx.length > MAX_CONTEXT) ctx = ctx.slice(0, MAX_CONTEXT) + '\n… (context truncated)';
  return ctx;
}

/* Extract { sql, context } from a report workbook — the SQL plus the
   rest of the sheets as supporting context for the analyzer.
   `data` is an ArrayBuffer (browser) or Buffer/Uint8Array (Node). */
export function extractReportFromWorkbook(data) {
  const wb = XLSX.read(data, { type: 'array' });
  const sqlSheet = pickSqlSheet(wb);
  return { sql: sqlFromSheet(wb.Sheets[sqlSheet]), context: contextFromWorkbook(wb, sqlSheet) };
}

/* SQL only (used by tests / direct callers). */
export function extractSqlFromWorkbook(data) {
  const wb = XLSX.read(data, { type: 'array' });
  return sqlFromSheet(wb.Sheets[pickSqlSheet(wb)]);
}

/* Read a browser FileList into [{ fileName, content, kind }].
   kind: 'sql' (report query to analyze) · 'report' (.xlsx with Cloudera SQL)
   · 'dtsx' (SSIS package) · 'conmgr' (SSIS project connection — supplies
   the database name for tables the packages reference by GUID).
   Unsupported files and empties are dropped by the caller. */
export function readUploadedFiles(fileList) {
  const files = Array.from(fileList).filter((f) => isSupported(f.name));
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          if (XLSX_EXT.test(file.name)) {
            reader.onload = (e) => {
              let sql = '';
              let context = '';
              try {
                ({ sql, context } = extractReportFromWorkbook(e.target.result));
              } catch {
                sql = '';
                context = '';
              }
              resolve({ fileName: file.name, content: sql, context, kind: 'report' });
            };
            reader.readAsArrayBuffer(file);
          } else if (DTSX_EXT.test(file.name) || CONMGR_EXT.test(file.name)) {
            const kind = DTSX_EXT.test(file.name) ? 'dtsx' : 'conmgr';
            reader.onload = (e) => resolve({ fileName: file.name, content: e.target.result, kind });
            reader.readAsText(file, 'utf-8');
          } else {
            reader.onload = (e) => resolve({ fileName: file.name, content: e.target.result, kind: 'sql' });
            reader.readAsText(file, 'utf-8');
          }
        }),
    ),
  );
}
