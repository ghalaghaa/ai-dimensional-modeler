/* ─────────────────────────────────────────────────────────
   Shared SQL table-reference extraction.
   Used by the analyzer reconciliation (claudeApi.js) and the
   SSIS .dtsx lineage parser (ssisLineage.js).
───────────────────────────────────────────────────────── */

/* ─── SQL FROM/JOIN table + alias extraction (real base tables only) ───
   A real source table is schema-qualified (contains a dot). Bare
   identifiers are CTE names / derived-table aliases and are skipped. The
   scan covers the WHOLE SQL, including CTE bodies, so a table used only in
   an anti-join or inside a WITH block is still discovered. Identifier parts
   may be plain, "double-quoted" (Cognos/SQL Server exports), [bracketed],
   or `backticked` — quotes are stripped from the returned names. Returns an
   array of { table, alias }. */
export const IDENT = '(?:"[^"]+"|\\[[^\\]]+\\]|`[^`]+`|[A-Za-z_]\\w*)';
const TABLE_REF_RE = new RegExp(
  // The dotted chain allows an EMPTY middle part (Db..Table — T-SQL
  // default-schema shorthand); the '..' is preserved in the result.
  '\\b(?:FROM|JOIN)\\s+(' + IDENT + '(?:\\s*\\.\\s*' + IDENT + '?)+)' +
  '(?:[ \\t]+(?:AS\\s+)?(' + IDENT + '))?', 'gi',
);

export function unquoteIdent(s) {
  return String(s ?? '').replace(/^["`[]/, '').replace(/["`\]]$/, '');
}

/* Quote-insensitive key for comparing table names ("A"."b"."C" ≡ a.b.c). */
export function normTable(t) {
  return String(t ?? '').replace(/["`[\]]/g, '').replace(/\s+/g, '').toLowerCase();
}

/* Strip quote characters from a possibly-dotted name, keeping the dot
   structure and original casing ([dbo].[D_Customer] → dbo.D_Customer). */
export function cleanTableName(t) {
  return String(t ?? '').replace(/["`[\]]/g, '').replace(/\s+/g, '');
}

export function tableRefs(sql) {
  const refs = [];
  let m;
  TABLE_REF_RE.lastIndex = 0;
  while ((m = TABLE_REF_RE.exec(String(sql || '')))) {
    const table = cleanTableName(m[1]);
    let alias = m[2] ? unquoteIdent(m[2]) : '';
    if (/^(on|inner|left|right|full|cross|join|where|group|order|union|having|limit|using|as)$/i.test(alias)) alias = '';
    refs.push({ table, alias });
  }
  return refs;
}
