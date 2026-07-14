import { tableRefs, normTable, cleanTableName } from './sqlTables';

/* ─────────────────────────────────────────────────────────
   SSIS lineage extraction.

   The report SQL only ever references the Cognos mart layer
   (e.g. Finance_MIS.dbo.F_AVG_RBG_MIS_ALL_YTD_AVG). The mapping from
   mart table back to the ORIGINAL source-system tables lives in the
   SSIS packages (.dtsx) / SQL load scripts that populate the mart.

   Verified against the project's real packages (COGNOSSRV):
   · Connections are PROJECT-level .conmgr files; components reference
     them as connectionManagerRefId="{GUID}:invalid" — the catalog
     (database) comes from the .conmgr's Initial Catalog, keyed by GUID.
   · Loads are CHAINED (F_X_YTD ← F_X_Rows ← 40+ F_AVG_* staging ←
     core files like bajsrpf) — lookups resolve transitively.
   · SqlCommands may reference BARE table names (FROM bajsrpf) whose
     database is implied by the component's connection.
   · SqlCommands contain commented-out SQL — comments are stripped.

   Store lifecycle: addLineageFiles(store, files) accepts .conmgr /
   .dtsx / .sql load scripts IN ANY ORDER — raw package text is kept
   and all entries are re-derived on every add, so a catalog arriving
   after its package still qualifies that package's tables.
───────────────────────────────────────────────────────── */

/* Decode the XML entities SSIS uses inside attribute/property values. */
function xmlDecode(s) {
  return String(s ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/* Strip -- line comments and block comments so commented-out SQL never
   contributes phantom source tables. */
function stripSqlComments(sql) {
  return String(sql ?? '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ');
}

const guidOf = (s) => /\{[0-9a-f-]+\}/i.exec(String(s ?? ''))?.[0]?.toLowerCase() || '';

const SQL_KEYWORDS = /^(select|where|group|order|union|having|on|as|inner|left|right|full|cross|join|and|or|not|case|when|then|else|end|with|values|set|from|into|exists|all|distinct|top)$/i;

/* Source tables read by a SQL command: schema-qualified refs (quoted or
   not) PLUS bare FROM/JOIN identifiers (their database is implied by the
   SSIS connection), excluding the command's own CTE names. */
function sourceTablesOf(sqlRaw) {
  const sql = stripSqlComments(sqlRaw);
  const out = tableRefs(sql).map((r) => r.table);
  const cteNames = new Set();
  const CTE_RE = /(?:\bWITH\s+|,\s*)("[^"]+"|\[[^\]]+\]|[A-Za-z_]\w*)\s+AS\s*\(/gi;
  let m;
  while ((m = CTE_RE.exec(sql))) cteNames.add(normTable(cleanTableName(m[1])));
  // The lookahead excludes word chars too, so \w* cannot backtrack one
  // character to sneak past the "not followed by a dot" test (which would
  // truncate Finance_MIS.dbo.X into a phantom source "Finance_MI").
  const BARE_RE = /\b(?:FROM|JOIN)\s+(?:\[([^\].]+)\]|([A-Za-z_]\w*))(?![\w.([])/gi;
  while ((m = BARE_RE.exec(sql))) {
    const t = cleanTableName(m[1] || m[2]);
    if (!t || t.includes('.') || SQL_KEYWORDS.test(t) || cteNames.has(normTable(t))) continue;
    if (t.startsWith('#') || t.startsWith('@')) continue;
    out.push(t);
  }
  return [...new Set(out)];
}

/* ── SQL-statement lineage (Execute SQL tasks & .sql load scripts) ──
   Returns [{ target, sources }] for every statement that writes a table. */
export function sqlStatementLineage(sqlRaw) {
  const sql = stripSqlComments(sqlRaw);
  const targets = new Set();
  const out = [];
  const TARGET_RE = /\b(?:INSERT\s+INTO|MERGE\s+INTO|MERGE|SELECT\s+[\s\S]{0,2000}?\bINTO)\s+((?:"[^"]+"|\[[^\]]+\]|`[^`]+`|[A-Za-z_]\w*)(?:\s*\.\s*(?:"[^"]+"|\[[^\]]+\]|`[^`]+`|[A-Za-z_]\w*)?)*)/gi;
  let m;
  while ((m = TARGET_RE.exec(sql))) {
    const t = cleanTableName(m[1]);
    if (!t || t.startsWith('#') || t.startsWith('@')) continue;
    targets.add(t);
  }
  if (!targets.size) return out;
  const sources = sourceTablesOf(sql).filter((t) => !t.startsWith('#') && !t.startsWith('@'));
  targets.forEach((target) => {
    const srcs = sources.filter((x) => normTable(x) !== normTable(target));
    if (srcs.length) out.push({ target, sources: srcs });
  });
  return out;
}

/* ── connection catalogs ───────────────────────────────── */

function catalogFromConnString(cs) {
  return /Initial Catalog=([^;"']+)/i.exec(xmlDecode(cs))?.[1]?.trim() || '';
}

/* Project-level .conmgr file → { keys: [guid, name], catalog }. */
export function parseConmgr(xmlText) {
  const xml = String(xmlText || '');
  const guid = guidOf(/DTS:DTSID="([^"]+)"/.exec(xml)?.[1]);
  const name = /DTS:ObjectName="([^"]+)"/.exec(xml)?.[1] || '';
  const cs =
    /DTS:ConnectionString="([^"]*)"/.exec(xml)?.[1] ||
    /<DTS:Property[^>]*DTS:Name="ConnectionString"[^>]*>([^<]*)</.exec(xml)?.[1] || '';
  const catalog = catalogFromConnString(cs);
  if (!catalog) return null;
  const keys = [guid, name.toLowerCase()].filter(Boolean);
  return keys.length ? { keys, catalog } : null;
}

/* In-package connection managers (older/self-contained packages). */
function packageCatalogs(xml, into) {
  const CM_RE = /<DTS:ConnectionManager\b([\s\S]*?)(?:\/>|<\/DTS:ConnectionManager>)/gi;
  let m;
  while ((m = CM_RE.exec(xml))) {
    const block = m[1];
    const cs =
      /DTS:ConnectionString="([^"]*)"/.exec(block)?.[1] ||
      /<DTS:Property[^>]*DTS:Name="ConnectionString"[^>]*>([^<]*)</.exec(block)?.[1] || '';
    const catalog = catalogFromConnString(cs);
    if (!catalog) continue;
    [
      /DTS:refId="([^"]+)"/.exec(block)?.[1]?.toLowerCase(),
      guidOf(/DTS:DTSID="([^"]+)"/.exec(block)?.[1]),
      /DTS:ObjectName="([^"]+)"/.exec(block)?.[1]?.toLowerCase(),
    ].filter(Boolean).forEach((k) => into.set(k, catalog));
  }
}

const catalogFor = (catalogs, ref) => {
  if (!ref) return '';
  const r = String(ref).toLowerCase();
  return catalogs.get(r) || catalogs.get(guidOf(r)) || '';
};

/* Qualify a table with its connection's database when it has no catalog:
   dbo.T → Catalog.dbo.T ; T → Catalog..T ; 3-part / no catalog → as-is. */
function qualify(table, catalog) {
  if (!table || !catalog) return table;
  const parts = table.split('.');
  if (parts.length >= 3) return table;
  if (parts.length === 2) return `${catalog}.${table}`;
  return `${catalog}..${table}`;
}

/* ── .dtsx parsing ─────────────────────────────────────── */

/* One pipeline (data flow): pair its source components with its
   destination components. Real packages use string class ids
   (Microsoft.OLEDBSource / Microsoft.OLEDBDestination); for GUID class
   ids (SSIS 2005/2008) fall back to input/output structure. */
function pipelineLineage(pipeXml, catalogs) {
  const comps = pipeXml.match(/<component\b[\s\S]*?<\/component>/gi) || [];
  const sources = [];
  const dests = [];
  comps.forEach((c) => {
    const cls = (/componentClassID="([^"]*)"/i.exec(c)?.[1] || '').toLowerCase();
    const props = {};
    const P_RE = /<property\b[^>]*name="(SqlCommand|OpenRowset|TableOrViewName)"[^>]*>([\s\S]*?)<\/property>/gi;
    let pm;
    while ((pm = P_RE.exec(c))) props[pm[1]] = xmlDecode(pm[2]).trim();
    const connRef =
      /connectionManagerRefId="([^"]+)"/i.exec(c)?.[1] ||
      /connectionManagerID="([^"]+)"/i.exec(c)?.[1] || '';
    const catalog = catalogFor(catalogs, connRef);

    const hasInputCols = /<inputColumn\b/i.test(c);
    const isDest = /destination/.test(cls) || (!/source/.test(cls) && hasInputCols);
    const isSource = /source/.test(cls) || (!isDest && !hasInputCols);

    const openRowset = props.OpenRowset || props.TableOrViewName || '';
    if (isDest) {
      const t = cleanTableName(openRowset);
      if (t) dests.push(qualify(t, catalog));
    } else if (isSource) {
      if (props.SqlCommand) {
        sourceTablesOf(props.SqlCommand).forEach((t) => sources.push(qualify(t, catalog)));
      } else if (openRowset) {
        sources.push(qualify(cleanTableName(openRowset), catalog));
      }
    }
  });
  const uniqSources = [...new Set(sources)];
  return dests
    .filter(Boolean)
    .map((target) => ({
      target,
      sources: uniqSources.filter((s) => normTable(s) !== normTable(target)),
    }))
    .filter((e) => e.sources.length);
}

/* Parse one .dtsx into lineage entries [{ package, target, sources }].
   `extraCatalogs` come from project-level .conmgr files. */
export function parseDtsxLineage(xmlText, fileName = '', extraCatalogs = new Map()) {
  const xml = String(xmlText || '');
  const catalogs = new Map(extraCatalogs);
  packageCatalogs(xml, catalogs);
  const entries = [];

  // Data-flow pipelines (both DTSX formats wrap them in a <pipeline> element).
  (xml.match(/<pipeline\b[\s\S]*?<\/pipeline>/gi) || []).forEach((p) => {
    pipelineLineage(p, catalogs).forEach((e) => entries.push({ package: fileName, ...e }));
  });

  // Execute SQL Tasks — attribute form and property-element form. The
  // package default catalog (most-used connection) qualifies bare names.
  const stmts = [];
  let m;
  const A_RE = /SqlStatementSource="([^"]*)"/gi;
  while ((m = A_RE.exec(xml))) stmts.push(xmlDecode(m[1]));
  const E_RE = /<DTS:Property[^>]*DTS:Name="SqlStatementSource"[^>]*>([\s\S]*?)<\/DTS:Property>/gi;
  while ((m = E_RE.exec(xml))) stmts.push(xmlDecode(m[1]));
  stmts.forEach((stmt) => {
    sqlStatementLineage(stmt).forEach((e) => entries.push({ package: fileName, ...e }));
  });

  return dedupeEntries(entries);
}

/* Parse a plain .sql load script into lineage entries. */
export function parseSqlScriptLineage(sqlText, fileName = '') {
  return dedupeEntries(
    sqlStatementLineage(sqlText).map((e) => ({ package: fileName, ...e })),
  );
}

function dedupeEntries(entries) {
  const byTarget = new Map();
  entries.forEach((e) => {
    const k = normTable(e.target);
    const cur = byTarget.get(k);
    if (cur) {
      e.sources.forEach((s) => {
        if (!cur.sources.some((x) => normTable(x) === normTable(s))) cur.sources.push(s);
      });
    } else {
      byTarget.set(k, { ...e, sources: [...e.sources] });
    }
  });
  return [...byTarget.values()];
}

/* ── lineage store ─────────────────────────────────────── */

export function emptyLineage() {
  return {
    catalogs: new Map(),   // guid / connection name → database
    packages: [],          // [{ fileName, content, type: 'dtsx' | 'sql' }]
    entries: [],           // [{ package, target, sources[] }]
    index: new Map(),      // lookup key → entries[]
    packageNames: new Set(),
  };
}

/* Keys a mart table can be looked up by, most → least specific:
   full name, schema.table, bare table. */
function keysFor(table) {
  const parts = normTable(table).split('.').filter(Boolean);
  if (!parts.length) return [];
  const keys = [parts.join('.')];
  if (parts.length >= 2) keys.push(parts.slice(-2).join('.'));
  keys.push(parts[parts.length - 1]);
  return [...new Set(keys)];
}

/* Add uploaded lineage files (.conmgr / .dtsx / .sql load scripts) in ANY
   order. Returns a NEW store (safe for React state): raw package text is
   retained and all entries re-derived so late-arriving .conmgr catalogs
   re-qualify earlier packages. */
export function addLineageFiles(store, files) {
  const next = emptyLineage();
  next.catalogs = new Map(store?.catalogs || []);
  next.packages = [...(store?.packages || [])];

  (files || []).forEach((f) => {
    if (f.kind === 'conmgr') {
      const c = parseConmgr(f.content);
      if (c) c.keys.forEach((k) => next.catalogs.set(k, c.catalog));
    } else if (f.kind === 'dtsx') {
      next.packages.push({ fileName: f.fileName, content: f.content, type: 'dtsx' });
    } else {
      next.packages.push({ fileName: f.fileName, content: f.content, type: 'sql' });
    }
  });

  next.packages.forEach((p) => {
    const entries = p.type === 'dtsx'
      ? parseDtsxLineage(p.content, p.fileName, next.catalogs)
      : parseSqlScriptLineage(p.content, p.fileName);
    entries.forEach((e) => {
      if (!e?.target || !e.sources?.length) return;
      next.entries.push(e);
      next.packageNames.add(p.fileName);
      keysFor(e.target).forEach((k) => {
        const arr = next.index.get(k) || [];
        arr.push(e);
        next.index.set(k, arr);
      });
    });
  });
  return next;
}

/* Entries whose target matches `table` (most-specific key wins). */
function entriesFor(store, table) {
  for (const k of keysFor(table)) {
    const arr = store.index.get(k);
    if (arr?.length) return arr;
  }
  return null;
}

/* mart table → { sources[], packages[], intermediates[] } | null.
   Loads are chained (mart ← staging ← core file), so sources that are
   themselves load targets are resolved TRANSITIVELY down to the ultimate
   origins; the traversed staging tables are reported as intermediates. */
export function lookupOriginal(store, table) {
  if (!store?.index?.size || !table) return null;
  if (!entriesFor(store, table)) return null;

  const sources = [];
  const packages = [];
  const intermediates = [];
  const seen = new Set([normTable(table)]);
  const addUnique = (list, v, key = (x) => normTable(x)) => {
    if (!list.some((x) => key(x) === key(v))) list.push(v);
  };

  const walk = (t, depth) => {
    const arr = entriesFor(store, t);
    if (!arr) { addUnique(sources, t); return; }
    arr.forEach((e) => {
      if (e.package) addUnique(packages, e.package, (x) => x);
      e.sources.forEach((s) => {
        const k = normTable(s);
        if (seen.has(k)) return;
        seen.add(k);
        if (depth < 10 && entriesFor(store, s)) {
          addUnique(intermediates, s);
          walk(s, depth + 1);
        } else {
          addUnique(sources, s);
        }
      });
    });
  };
  walk(table, 0);
  return sources.length ? { sources, packages, intermediates } : null;
}
