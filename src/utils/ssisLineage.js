import { tableRefs, normTable, cleanTableName } from './sqlTables';

/* ─────────────────────────────────────────────────────────
   SSIS lineage extraction.

   The report SQL only ever references the Cognos mart layer
   (e.g. Finance_MIS.dbo.D_Customer_Details_Month_End). The mapping
   from mart table back to the ORIGINAL source-system tables lives in
   the SSIS packages (.dtsx) / SQL load scripts that populate the mart.

   This module parses those files into lineage entries
   { package, target, sources[] } and answers lookups:
   mart table → original source tables.

   Supported inputs:
   · .dtsx (SSIS 2005-2008 and 2012+ XML formats):
     - Data-flow pipelines: OLE DB Source (SqlCommand / OpenRowset)
       paired with OLE DB Destination (OpenRowset) per <pipeline>.
     - Execute SQL Tasks: INSERT INTO / SELECT INTO / MERGE statements.
   · .sql load scripts: INSERT INTO / SELECT INTO / MERGE / UPDATE-FROM.
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

/* ── SQL-statement lineage (shared by Execute SQL tasks & .sql scripts) ──
   Returns [{ target, sources }] for every statement that writes a table. */
export function sqlStatementLineage(sql) {
  const s = String(sql || '');
  const targets = new Set();
  const out = [];
  const TARGET_RE = /\b(?:INSERT\s+INTO|MERGE\s+INTO|MERGE|SELECT\s+[\s\S]{0,2000}?\bINTO)\s+((?:"[^"]+"|\[[^\]]+\]|`[^`]+`|[A-Za-z_]\w*)(?:\s*\.\s*(?:"[^"]+"|\[[^\]]+\]|`[^`]+`|[A-Za-z_]\w*)?)*)/gi;
  let m;
  while ((m = TARGET_RE.exec(s))) {
    const t = cleanTableName(m[1]);
    // #temp tables and single-part names that are obviously variables are kept
    // only if they look like real tables; temp tables are never lineage targets.
    if (!t || t.startsWith('#') || t.startsWith('@')) continue;
    targets.add(t);
  }
  if (!targets.size) return out;
  const sources = [...new Set(tableRefs(s).map((r) => r.table))]
    .filter((t) => !t.startsWith('#') && !t.startsWith('@'));
  targets.forEach((target) => {
    const srcs = sources.filter((x) => normTable(x) !== normTable(target));
    if (srcs.length) out.push({ target, sources: srcs });
  });
  return out;
}

/* ── .dtsx parsing ─────────────────────────────────────── */

/* Connection managers: refId/name → Initial Catalog (database name), used to
   qualify 2-part OpenRowset names ([dbo].[T] → Catalog.dbo.T). */
function connectionCatalogs(xml) {
  const cat = new Map(); // key (refId or object name, lowercased) → catalog
  const CM_RE = /<DTS:ConnectionManager\b([\s\S]*?)(?:\/>|<\/DTS:ConnectionManager>)/gi;
  let m;
  while ((m = CM_RE.exec(xml))) {
    const block = m[1];
    const refId = /DTS:refId="([^"]+)"/.exec(block)?.[1];
    const name = /DTS:ObjectName="([^"]+)"/.exec(block)?.[1];
    const cs =
      /DTS:ConnectionString="([^"]*)"/.exec(block)?.[1] ||
      /<DTS:Property[^>]*DTS:Name="ConnectionString"[^>]*>([^<]*)</.exec(block)?.[1] ||
      '';
    const catalog = /Initial Catalog=([^;"']+)/i.exec(xmlDecode(cs))?.[1]?.trim();
    if (!catalog) continue;
    if (refId) cat.set(refId.toLowerCase(), catalog);
    if (name) cat.set(name.toLowerCase(), catalog);
  }
  return cat;
}

/* Qualify a table with its connection's database when it has no catalog part:
   dbo.T → Catalog.dbo.T ; T → Catalog..T ; already 3-part → unchanged. */
function qualify(table, catalog) {
  if (!table || !catalog) return table;
  const parts = table.split('.');
  if (parts.length >= 3) return table;
  if (parts.length === 2) return `${catalog}.${table}`;
  return `${catalog}..${table}`;
}

/* One pipeline (data flow): pair its source components with its destination
   components. A component is a destination when its class says so, or —
   for GUID class ids (SSIS 2005/2008) — when it has input columns but no
   data outputs. */
function pipelineLineage(pipeXml, catalogs) {
  const comps = pipeXml.match(/<component\b[\s\S]*?<\/component>/gi) || [];
  const sources = [];
  const dests = [];
  comps.forEach((c) => {
    const cls = (/componentClassID="([^"]*)"/i.exec(c)?.[1] || '').toLowerCase();
    const props = {};
    const P_RE = /<property\b[^>]*name="(SqlCommand|OpenRowset|OpenRowsetVariable|TableOrViewName)"[^>]*>([\s\S]*?)<\/property>/gi;
    let pm;
    while ((pm = P_RE.exec(c))) props[pm[1]] = xmlDecode(pm[2]).trim();
    const connRef = (
      /connectionManagerRefId="([^"]+)"/i.exec(c)?.[1] ||
      /connectionManagerID="([^"]+)"/i.exec(c)?.[1] ||
      ''
    ).toLowerCase();
    const catalog = catalogs.get(connRef);

    const hasInputCols = /<inputColumn\b/i.test(c);
    const hasOutputCols = /<outputColumn\b/i.test(c) && !/isErrorOut="true"[^>]*>[\s\S]*<outputColumn/i.test(c);
    const isDest = /destination/.test(cls) || (!/source/.test(cls) && hasInputCols && !hasOutputCols);
    const isSource = /source/.test(cls) || (!isDest && !hasInputCols);

    const openRowset = props.OpenRowset || props.TableOrViewName || '';
    if (isDest) {
      const t = cleanTableName(openRowset);
      if (t) dests.push(qualify(t, catalog));
    } else if (isSource) {
      if (props.SqlCommand) {
        tableRefs(props.SqlCommand).forEach((r) => sources.push(qualify(r.table, catalog)));
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

/* Parse one .dtsx file into lineage entries [{ package, target, sources }]. */
export function parseDtsxLineage(xmlText, fileName = '') {
  const xml = String(xmlText || '');
  const catalogs = connectionCatalogs(xml);
  const entries = [];

  // Data-flow pipelines (both DTSX formats wrap them in a <pipeline> element).
  (xml.match(/<pipeline\b[\s\S]*?<\/pipeline>/gi) || []).forEach((p) => {
    pipelineLineage(p, catalogs).forEach((e) => entries.push({ package: fileName, ...e }));
  });

  // Execute SQL Tasks — attribute form and property-element form.
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

/* ── lineage store + lookup ────────────────────────────── */

export function emptyLineage() {
  return { entries: [], index: new Map(), packages: new Set() };
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

/* Immutable merge — returns a NEW store (safe for React state). */
export function mergeLineage(store, entries) {
  const next = {
    entries: [...(store?.entries || [])],
    index: new Map(store?.index || []),
    packages: new Set(store?.packages || []),
  };
  (entries || []).forEach((e) => {
    if (!e?.target || !e.sources?.length) return;
    next.entries.push(e);
    if (e.package) next.packages.add(e.package);
    keysFor(e.target).forEach((k) => {
      const arr = next.index.get(k) ? [...next.index.get(k)] : [];
      arr.push(e);
      next.index.set(k, arr);
    });
  });
  return next;
}

/* mart table → { sources[], packages[] } | null. Tries the most specific
   key first so Finance_MIS.dbo.D_X beats a bare D_X collision. */
export function lookupOriginal(store, table) {
  if (!store?.index?.size || !table) return null;
  for (const k of keysFor(table)) {
    const arr = store.index.get(k);
    if (arr?.length) {
      const sources = [];
      const packages = [];
      arr.forEach((e) => {
        e.sources.forEach((s) => {
          if (!sources.some((x) => normTable(x) === normTable(s))) sources.push(s);
        });
        if (e.package && !packages.includes(e.package)) packages.push(e.package);
      });
      return { sources, packages };
    }
  }
  return null;
}
