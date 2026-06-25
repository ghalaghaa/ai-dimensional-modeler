import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportJSON(results) {
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  saveAs(blob, 'dimensional_model.json');
}

export function exportExcel(results) {
  const wb = XLSX.utils.book_new();

  /* ── ورقة 1: الملخّص ─────────────────────────────────────────── */
 /* ── Sheet 1: Summary ─────────────────────────────────────────── */
const summaryRows = [[
  'Report Name', 'Grain', 'Quality %',
  'Fact Tables', 'Dimension Tables', 'Source Tables', 'Notes',
]];

  results.forEach((r) => {
    const v = r.result;
    summaryRows.push([
      v.report_name ?? r.fileName,
      v.grain ?? '',
      v.quality_score ?? '',
      (v.facts ?? []).map(f => f.name).join('، '),
      (v.dimensions ?? []).map(d => d.name).join('، '),
      (v.source_tables ?? []).join('، '),
      v.notes ?? '',
    ]);
  });
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 30 }, { wch: 42 }, { wch: 12 },
    { wch: 35 }, { wch: 45 }, { wch: 60 }, { wch: 50 },
  ];
XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  /* ── ورقة 2: جداول الحقائق ──────────────────────────────────── */
 const factRows = [[
  'Report',
  'Fact Table',
  'Grain',
  'Fact Type',
  'Measure Name',
  'Measure Type',
  'Aggregation / Formula',
  'Source Column',
  'Transformation Rule',
  'Data Quality Check',
  'Foreign Keys'
]];
  results.forEach((r) => {
    (r.result.facts ?? []).forEach((f) => {
      const reportName = r.result.report_name ?? r.fileName;
      const fkStr      = (f.foreign_keys ?? []).join('، ');
      const base       = f.base_measures    ?? f.measures ?? [];   // دعم النسختين
      const deriv      = f.derived_measures ?? [];

      if (!base.length && !deriv.length) {
        factRows.push([reportName, f.name, f.grain ?? '', f.fact_type ?? '',
          '', '', '', '', '', '', fkStr]);
        return;
      }
      base.forEach((m) => {
        factRows.push([
          reportName, f.name, f.grain ?? '', f.fact_type ?? '',
          m.name, 'أساسي', m.aggregation ?? '',
          m.source_column ?? '',
          m.transformation ?? `${m.aggregation ?? ''}(${m.source_column ?? ''})`,
          m.data_quality ?? 'NOT NULL · ≥ 0',
          fkStr,
        ]);
      });
      deriv.forEach((m) => {
        factRows.push([
          reportName, f.name, f.grain ?? '', f.fact_type ?? '',
          m.name, 'مشتق', m.formula ?? '',
          '—', m.formula ?? '', m.data_quality ?? '', fkStr,
        ]);
      });
    });
  });
  const wsFacts = XLSX.utils.aoa_to_sheet(factRows);
  wsFacts['!cols'] = [
    { wch: 26 }, { wch: 26 }, { wch: 36 }, { wch: 20 },
    { wch: 26 }, { wch: 12 }, { wch: 32 },
    { wch: 28 }, { wch: 44 }, { wch: 36 }, { wch: 40 },
  ];
XLSX.utils.book_append_sheet(wb, wsFacts, 'Fact Tables');
  /* ── ورقة 3: جداول الأبعاد ──────────────────────────────────── */
const dimRows = [[
  'Report',
  'Dimension Table',
  'Grain',
  'Business Key',
  'Surrogate Key',
  'SCD Type',
  'Attributes',
  'Source Table',
  'Inferred'
]];
  results.forEach((r) => {
    (r.result.dimensions ?? []).forEach((d) => {
      dimRows.push([
        r.result.report_name ?? r.fileName,
        d.name, d.grain ?? '',
        d.business_key ?? '', d.surrogate_key ?? '',
        d.scd_type ?? '',
        (d.attributes ?? []).join('، '),
        d.source_table ?? '',
        d.inferred ? 'نعم ⚠' : 'لا',
      ]);
    });
  });
  const wsDims = XLSX.utils.aoa_to_sheet(dimRows);
  wsDims['!cols'] = [
    { wch: 26 }, { wch: 26 }, { wch: 30 },
    { wch: 22 }, { wch: 22 }, { wch: 10 },
    { wch: 50 }, { wch: 42 }, { wch: 10 },
  ];
XLSX.utils.book_append_sheet(wb, wsDims, 'Dimension Tables');
  /* ── ورقة 4: ورقة المطابقة (ETL) ────────────────────────────── */
const mappingRows = [[
  'Target Table',
  'Target Column',
  'Source Table (RAW)',
  'Source Column',
  'Transformation Rule',
  'Key Type',
  'SCD Type',
  'Data Quality Check',
  'Load Order'
]];

  results.forEach((r) => {

    /* ── الأبعاد أولاً (ترتيب 1) ─────────────────────────────── */
    (r.result.dimensions ?? []).forEach((d) => {

      // المفتاح البديل — مولّد دائماً
      mappingRows.push([
        d.name,
        d.surrogate_key ?? `${d.name}_Key`,
        'مولّد تلقائياً',
        'SEQUENCE',
        'توليد مفتاح بديل (SEQUENCE أو HASH)',
        'مفتاح بديل',
        d.scd_type ?? '',
        'NOT NULL · UNIQUE · رقم صحيح موجب',
        1,
      ]);

      if (d.column_mappings?.length) {
        // استخدم قواعد التحويل الغنية من الذكاء الاصطناعي
        d.column_mappings.forEach((cm) => {
          const keyType = cm.target_column === d.business_key ? 'مفتاح طبيعي' : 'سمة';
          mappingRows.push([
            d.name,
            cm.target_column ?? '',
            d.source_table ?? '',
            cm.source_column ?? '',
            cm.transformation ?? 'نسخ مباشر',
            keyType,
            d.scd_type ?? '',
            cm.data_quality ?? 'تحقق من خلو القيم',
            1,
          ]);
        });
      } else {
        // احتياطي للموديلات التي لا تحتوي column_mappings
        mappingRows.push([
          d.name, d.business_key ?? '', d.source_table ?? '',
          d.business_key ?? '', `نسخ مباشر من ${d.business_key ?? 'المفتاح الطبيعي'}`,
          'مفتاح طبيعي', '', 'NOT NULL', 1,
        ]);
        (d.attributes ?? []).forEach((attr) => {
          mappingRows.push([
            d.name, attr, d.source_table ?? '', attr,
            `نسخ مباشر من ${attr}`,
            'سمة', d.scd_type ?? '', 'تحقق من خلو القيم', 1,
          ]);
        });
      }

      // أعمدة SCD Type 2 الإضافية
      if (d.scd_type === 'Type 2') {
        const scdCols = [
          ['effective_date', 'CURRENT_DATE', "CAST(CURRENT_DATE AS DATE)", 'تاريخ السريان', 'NOT NULL'],
          ['expiry_date',    'NULL',         "CAST('9999-12-31' AS DATE)", 'تاريخ الانتهاء', 'يُحدَّث عند التغيير'],
          ['is_current',     '1',            'CAST(1 AS TINYINT)',         'علم السجل الحالي', '1 = حالي · 0 = منتهٍ'],
        ];
        scdCols.forEach(([col, src, tr, ktype, dq]) => {
          mappingRows.push([d.name, col, d.source_table ?? '', src, tr, ktype, 'Type 2', dq, 1]);
        });
      }
    });

    /* ── الحقائق ثانياً (ترتيب 2) ───────────────────────────── */
    (r.result.facts ?? []).forEach((f) => {
      const base  = f.base_measures    ?? f.measures ?? [];   // دعم النسختين
      const deriv = f.derived_measures ?? [];

      base.forEach((m) => {
        mappingRows.push([
          f.name, m.name,
          'منطقة البيانات الخام (RAW)',
          m.source_column ?? '',
          m.transformation ?? `${m.aggregation ?? ''}(${m.source_column ?? ''})`,
          'مقياس أساسي', '',
          m.data_quality ?? 'NOT NULL · ≥ 0',
          2,
        ]);
      });

      deriv.forEach((m) => {
        mappingRows.push([
          f.name, m.name,
          'محسوب', '—',
          m.formula ?? '',
          'مقياس مشتق', '',
          m.data_quality ?? 'تحقق من نتيجة الصيغة',
          2,
        ]);
      });

      (f.foreign_keys ?? []).forEach((fk) => {
        const colName = fk.replace('DIM_', '').toLowerCase() + '_key';
        mappingRows.push([
          f.name, colName, fk, 'surrogate_key',
          `بحث في ${fk} → مفتاح بديل (LOOKUP)`,
          'مفتاح أجنبي', '',
          'NOT NULL · سلامة مرجعية',
          2,
        ]);
      });
    });
  });

  const wsMapping = XLSX.utils.aoa_to_sheet(mappingRows);
  wsMapping['!cols'] = [
    { wch: 28 }, { wch: 26 }, { wch: 40 },
    { wch: 26 }, { wch: 50 },
    { wch: 16 }, { wch: 10 }, { wch: 40 }, { wch: 14 },
  ];
XLSX.utils.book_append_sheet(wb, wsMapping, ' Mapping');
  /* ── كتابة الملف ─────────────────────────────────────────────── */
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'dimensional_model.xlsx');
}
