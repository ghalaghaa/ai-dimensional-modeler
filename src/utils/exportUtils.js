import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportJSON(results) {
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  saveAs(blob, 'dimensional_model.json');
}

/* ─────────────────────────────────────────────────────────
   Two sheets only — Facts and Dimensions.
   Each sheet: derived MODEL on the LEFT, source SQL on the RIGHT,
   so the team can see clearly: upload query -> fact/dimension model.
───────────────────────────────────────────────────────── */
const FACT_HEADERS = [
  'Fact Table', 'Grain', 'Fact Type', 'Measure', 'Type',
  'Aggregation / Formula', 'Source Column', 'Transformation', 'Data Quality', 'Foreign Keys',
];
const DIM_HEADERS = [
  'Dimension', 'Grain', 'Business Key', 'Surrogate Key', 'SCD Type',
  'Source Table', 'Target Column', 'Source Column', 'Transformation', 'Data Quality',
];

/* One model row per measure (base + derived) */
function factRowsFor(v) {
  const rows = [];
  (v.facts ?? []).forEach((f) => {
    const fk    = (f.foreign_keys ?? []).join(', ');
    const base  = f.base_measures ?? f.measures ?? [];
    const deriv = f.derived_measures ?? [];

    if (!base.length && !deriv.length) {
      rows.push([f.name, f.grain ?? '', f.fact_type ?? '', '', '', '', '', '', '', fk]);
    }
    base.forEach((m) => rows.push([
      f.name, f.grain ?? '', f.fact_type ?? '', m.name, 'Base',
      m.aggregation ?? '', m.source_column ?? '',
      m.transformation ?? `${m.aggregation ?? ''}(${m.source_column ?? ''})`,
      m.data_quality ?? 'NOT NULL · >= 0', fk,
    ]));
    deriv.forEach((m) => rows.push([
      f.name, f.grain ?? '', f.fact_type ?? '', m.name, 'Derived',
      m.formula ?? '', '—', m.formula ?? '', m.data_quality ?? '', fk,
    ]));
  });
  return rows;
}

/* One model row per column mapping (traces target column -> source) */
function dimRowsFor(v) {
  const rows = [];
  (v.dimensions ?? []).forEach((d) => {
    const surrogate = d.surrogate_key || `${d.name}_Key`;
    const mappings = d.column_mappings?.length
      ? d.column_mappings
      : [
          {
            target_column: d.business_key, source_column: d.business_key,
            transformation: `Direct copy from ${d.business_key ?? ''}`,
            data_quality: 'NOT NULL · UNIQUE',
          },
          ...(d.attributes ?? []).map((a) => ({
            target_column: a, source_column: a,
            transformation: `Direct copy from ${a}`, data_quality: 'Check for nulls',
          })),
        ];
    mappings.forEach((cm) => rows.push([
      d.name, d.grain ?? '', d.business_key ?? '', surrogate, d.scd_type ?? '',
      d.source_table ?? '', cm.target_column ?? '', cm.source_column ?? '',
      cm.transformation ?? '', cm.data_quality ?? '',
    ]));
  });
  return rows;
}

function buildSheet(results, kind) {
  const headers    = kind === 'facts' ? FACT_HEADERS : DIM_HEADERS;
  const leftWidth  = headers.length;
  const single     = results.length === 1;
  const modelTitle = kind === 'facts' ? 'FACT MODEL' : 'DIMENSION MODEL';

  const aoa = [];
  // Title row: model name on the left, query label on the right
  const titleLeft = single
    ? `${modelTitle}: ${results[0].result?.report_name ?? results[0].fileName}`
    : modelTitle;
  aoa.push([titleLeft, ...Array(leftWidth - 1).fill(''), '', 'Source Query (SQL)']);
  // Column header row (left panel)
  aoa.push([...headers, '', '']);

  results.forEach((r, idx) => {
    const v = r.result ?? {};
    const queryLines = String(r.content ?? '').replace(/\r\n?/g, '\n').split('\n');

    const leftRows = [];
    if (!single) leftRows.push([`▼ ${v.report_name ?? r.fileName}`]);
    leftRows.push(...(kind === 'facts' ? factRowsFor(v) : dimRowsFor(v)));

    // Merge: model rows on the left, one SQL line per row on the right
    const height = Math.max(leftRows.length, queryLines.length);
    for (let i = 0; i < height; i++) {
      const left   = leftRows[i] ?? [];
      const padded = Array.from({ length: leftWidth }, (_, c) => left[c] ?? '');
      aoa.push([...padded, '', queryLines[i] ?? '']);
    }
    if (idx < results.length - 1) aoa.push([]); // blank separator between files
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const widths = kind === 'facts'
    ? [24, 46, 16, 24, 10, 46, 26, 46, 30, 46]
    : [24, 40, 24, 24, 10, 42, 26, 26, 46, 30];
  ws['!cols'] = [...widths.map((w) => ({ wch: w })), { wch: 3 }, { wch: 110 }];
  return ws;
}

export function exportExcel(results) {
  const wb = XLSX.utils.book_new();
  wb.Workbook = { Views: [{ RTL: false }] }; // keep model on the left, query on the right
  XLSX.utils.book_append_sheet(wb, buildSheet(results, 'facts'), 'Facts');
  XLSX.utils.book_append_sheet(wb, buildSheet(results, 'dims'),  'Dimensions');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'dimensional_model.xlsx');
}
