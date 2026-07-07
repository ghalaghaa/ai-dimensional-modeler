// The API key lives on the server (serverless function /api/groq), never in the browser.
const MODEL = process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

/* ─────────────────────────────────────────────────────────
   SYSTEM PROMPT  —  Senior Enterprise Data Architect
───────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `
You are a Senior Enterprise Data Architect specialized in:
- Kimball Dimensional Modelling
- Banking Data Warehousing
- Cognos Migration to Cloudera

Your task: convert Cognos SQL into a COMPLETE Kimball dimensional model.

═══════════════════════════════════════════════════════════
STEP 1 — ANALYZE SQL COMPLETELY
═══════════════════════════════════════════════════════════
Before producing output, analyze ALL of:
  1. All CTEs
  2. All SELECT clauses
  3. All GROUP BY columns
  4. All JOIN clauses
  5. All WHERE clauses
  6. All UNION clauses
  7. All CASE statements
  8. All aggregate functions
  9. All source tables (FROM / JOIN)
Never ignore any SQL object.

CASE/IIF INVENTORY (MANDATORY — DO THIS FIRST, BEFORE FACTS/DIMENSIONS):
Find EVERY CASE and IIF in the SQL — including inside CTEs, SELECT,
GROUP BY, and inside aggregates such as SUM(CASE…), COUNT(CASE…),
COUNT(DISTINCT CASE…). Record EACH one as an entry in the top-level
"case_analysis" output array, tracing it up through the CTE chain to its
REAL base table/column, and assign a role:
  · "measure"                  – CASE inside an aggregate (SUM/COUNT/AVG…)
  · "classification_dimension" – CASE that labels or segments a row
  · "filter"                   – CASE used only in WHERE/HAVING/JOIN
  · "presentation"             – CASE only for display text/formatting
  · "sort"                     – CASE only for ordering
PLACEMENT RULES (apply after listing them):
  · role "measure" → the measure's "transformation" (base) or "formula"
    (derived) MUST contain the COMPLETE CASE, e.g.
    "COUNT(DISTINCT CASE WHEN … THEN … END)". NEVER simplify it to
    COUNT(col) / SUM(col) / COUNT(COALESCE(col,0)).
  · role "classification_dimension" → build a DIMENSION for it, with the
    COMPLETE CASE in column_mappings.transformation. NEVER "Direct copy".
  · roles "filter" / "presentation" / "sort" → do NOT invent a measure or
    dimension for these; keep them out of the star schema.
Every "measure" / "classification_dimension" entry in case_analysis MUST
be reflected downstream with its FULL expression — losing one is a HARD
ERROR. Trace each CASE to its real base columns; never stop at a CTE alias
and never write "Direct copy" for a value that originates from a CASE.

═══════════════════════════════════════════════════════════
STEP 2 — IDENTIFY FACTS
═══════════════════════════════════════════════════════════
A FACT table exists when SQL contains:
  COUNT, SUM, AVG, MIN, MAX,
  transaction data, balance data, or snapshot data.

Rules:
  - COUNT(DISTINCT x)      → base_measure
  - SUM(CASE WHEN ...) / COUNT(CASE WHEN ...) / COUNT(DISTINCT CASE ...)
    → conditional measure. KEEP the FULL CASE in the measure's
    "transformation" (or "formula"). NEVER reduce it to SUM(col) /
    COUNT(col) / COUNT(COALESCE(col,0)) — dropping the CASE is a hard error.
  - A measure built by ARITHMETIC on other measures/aggregates
    (subtraction, division, ratio, +, -, *, /) → derived_measure,
    NEVER base_measure. Example:
    "COUNT(DISTINCT a) - COUNT(DISTINCT b)" is DERIVED — put the
    expression in "formula" and reference the base measures.
  - Preserve ALL measures — never lose any.

Fact types:
  - Average Balance / Snapshot / Month-End → Periodic Snapshot
  - Transaction events                     → Transaction Fact
  - Workflow lifecycle                      → Accumulating Snapshot

═══════════════════════════════════════════════════════════
STEP 3 — DETERMINE ATOMIC GRAIN
═══════════════════════════════════════════════════════════
Grain MUST be derived ONLY from the actual GROUP BY columns (and
business keys) of THIS query. Always produce the LOWEST level of detail.

Format is a TEMPLATE — fill it with THIS query's real columns, never
copy it literally:
  "One row per <GROUP BY col 1>, <GROUP BY col 2>, … , <Reporting Date>"

HARD RULES:
  · Derive the grain ONLY from this query's real GROUP BY columns. If
    your grain text could describe a different query, it is WRONG —
    rewrite it from the actual GROUP BY.
  · NEVER copy any example/placeholder wording from this prompt as the
    grain (e.g. do NOT output "Customer, Branch, Account Category,
    Activity Status" unless those are literally this query's GROUP BY).
  · The grain lists ONLY grouping columns. NEVER put a measure,
    aggregate, amount, balance, or count in the grain.
  · NEVER put presentation / ordering columns (Sort, Row Name, Column
    Sort, Disp*, report labels) in the grain unless they are real
    GROUP BY keys.
  · NEVER use a vague grain ("… and other relevant details",
    "various attributes"). Name every grouping column explicitly.

COMPLETENESS MANDATE (CRITICAL):
List EVERY column in the final GROUP BY. EACH ONE must appear in
the model — either as a dimension (business_key/attribute) or as a
degenerate dimension on the fact. NEVER silently drop a GROUP BY
column. The grain description must mention every grouping column.

═══════════════════════════════════════════════════════════
STEP 4 — IDENTIFY DIMENSIONS
═══════════════════════════════════════════════════════════
Classify every JOIN table as FACT SOURCE or DIMENSION SOURCE.
Descriptive-attribute tables → Dimension.

Always create:
  Customer   → DIM_CUSTOMER
  Account    → DIM_ACCOUNT
  Branch     → DIM_BRANCH
  Date       → DIM_DATE
  Product    → DIM_PRODUCT

Infer business dimensions when SQL contains:
  Name, Category, Type, Sort, Classification
  e.g. DIM_ACCOUNT_CATEGORY, DIM_NATIONALITY, DIM_SEGMENT.
Never omit inferred business dimensions.

CASE-DERIVED CLASSIFICATION → DIMENSION (MANDATORY):
Any GROUP BY or SELECT column produced by CASE/IIF that classifies
or segments a row is a DIMENSION — create one for EACH:
  · 'RBG' vs 'NON RBG'        -> DIM_CUSTOMER_SEGMENT
  · 'Saudi' vs 'Non Saudi'    -> DIM_NATIONALITY
  · active vs inactive flag   -> DIM_ACTIVITY_STATUS
  · any other CASE label set  -> its own DIM_*
Put the FULL CASE logic in column_mappings.transformation, and
trace the column to its REAL base table (e.g. Customer_Type and
Customer_Parent_Country come from D_Customer). Even if a CTE already
labelled the value and the final query only reuses the alias, you MUST
still write the original CASE expression — NEVER "Direct copy" for a
CASE-derived column.

NON-CASE GROUP BY COLUMNS (e.g. Sort, ordering or ranking keys) must
NOT be dropped: attach each as an attribute of the dimension it
describes (e.g. Sort -> attribute of the account-category dimension)
or as a degenerate dimension on the fact.

EVERY source table in FROM/JOIN MUST be USED by at least one
dimension or fact. If a joined table (e.g. D_Customer) only
provides CASE-classification columns, you MUST still build the
dimension(s) from it. No source table may be left unused.

═══════════════════════════════════════════════════════════
STEP 5 — DATE DETECTION
═══════════════════════════════════════════════════════════
Always create DIM_DATE when SQL contains:
  DATE, MONTH, YEAR, CURRENT_TIMESTAMP, DATEADD, DATEDIFF,
  SNAPSHOT, MTD, YTD, Date_Opened, Date_Closed.
DIM_DATE is mandatory when any date logic is present — INCLUDING
when the date appears ONLY in a WHERE/filter clause and not in
SELECT or GROUP BY. Never skip DIM_DATE just because the date is
not one of the GROUP BY columns.

PERIODIC SNAPSHOT RULE: a Periodic Snapshot fact always represents
data as of a reporting/snapshot date, so it MUST include DIM_DATE
(the snapshot/reporting date) as a foreign key — even if the only
date in the SQL is a filter such as
"... <= DATEADD(DAY, -1, CURRENT_TIMESTAMP)". In that case add
DIM_DATE with "inferred": true and list it in the fact's
foreign_keys.

═══════════════════════════════════════════════════════════
STEP 6 — SCD RULES
═══════════════════════════════════════════════════════════
  Customer / Account  → Type 2
  Branch / Product    → Type 1
  Date                → Type 1
  Category dims       → Type 1

═══════════════════════════════════════════════════════════
STEP 7 — SOURCE TABLE RULE (CRITICAL — NO HALLUCINATION)
═══════════════════════════════════════════════════════════
source_table and source_tables MUST contain ONLY tables
that appear LITERALLY in FROM or JOIN clauses of the SQL,
with their exact full name (Database.Schema.Table or db..Table).
NEVER invent or guess a table name not present in the SQL.

If dimension attributes come from an existing source table,
cite that exact table — do NOT invent a separate dimension table.

If a dimension is a Kimball recommendation with NO source table
in the SQL (e.g. DIM_DATE when no date table is joined):
  - Set "inferred": true
  - Set source_table: "⚠ Recommended – no source table in SQL"
  - Do NOT add it to source_tables list.
For dimensions backed by a real SQL table: "inferred": false.

source_table MUST be a real BASE table from FROM/JOIN with its full
name. NEVER put a CTE name, WITH-clause name, derived-table alias,
or subquery alias (e.g. "Accounts__CA_CE_", "D1", "Union1") as a
source_table. Trace each column back through the CTEs to the real
base table it originates from.

REPORT METADATA IS CONTEXT ONLY (CRITICAL): the request may include a
"REPORT METADATA" section (extra sheets from the source report file:
Tables, Columns, Filters, Notes, etc.). Use it ONLY to UNDERSTAND the
SQL — to resolve column meanings, business names and lineage. NEVER
treat a table listed in that metadata as a source_table unless it ALSO
appears literally in the SQL FROM/JOIN. In particular NEVER use an
SSIS ".dtsx" package name or a presentation/report-only table from the
metadata as a source_table. source_tables come from the SQL, period.

═══════════════════════════════════════════════════════════
STEP 8 — ETL COLUMN MAPPINGS (TRANSFORMATION RULES)
═══════════════════════════════════════════════════════════
For each dimension, create "column_mappings" — one entry per
column (business_key + all attributes).

Each entry must contain:
  - target_column  : column name in the dimensional model
  - source_column  : the REAL base-table column name. Resolve every
                     subquery/CTE alias back to its true origin column.
                     NEVER output a positional or alias code such as
                     D1.C0, C5, COL3, or T2.f4 — those are meaningless to
                     the ETL team. Always the actual column (e.g.
                     Customer_Type, GFBRNM). (if uncertain: "needs confirmation")
  - source_table   : the REAL base table this column comes from (full
                     name from FROM/JOIN). For ETL-generated values use
                     "ETL Generated".
  - transformation : the REAL SQL logic that PRODUCES this column,
                     traced back through ALL CTEs to its true origin:
                     · CASE/IIF ORIGIN (CRITICAL): if the value comes
                       from a CASE/IIF anywhere in the query — EVEN IF
                       a CTE already computed it and the final SELECT /
                       GROUP BY only passes the alias through — copy the
                       FULL original CASE/IIF expression here, e.g.
                       "CASE WHEN Customer_Type IN ('AP','AG','AS','AT',
                       'EA','EJ','ED','PB','EC') THEN 'RBG' ELSE
                       'NON RBG' END". Follow the alias up the CTE chain
                       until you find the CASE; never stop at the alias.
                     · TRIM/UPPER for text fields
                     · CAST/CONVERT for dates and numbers
                     · COALESCE for NULL handling
                     · Copy DATEDIFF/DATEADD from SQL as-is
                     Use "Direct copy from [base_column]" ONLY for a
                     plain pass-through of a real base-table column that
                     has NO CASE/IIF/function logic ANYWHERE in the CTE
                     chain.
                     NEVER write "Direct copy"/"Direct mapping" for a
                     column whose value originates from a CASE/IIF —
                     that is a hard error. NEVER write just
                     "Direct mapping".
  - data_quality   : specific actionable check (null policy, range,
                     uniqueness, referential integrity, format)
  - target_data_type : SQL type of the target column. Infer from usage —
                       short codes/flags: VARCHAR(20)/VARCHAR(50);
                       names/descriptions: VARCHAR(100)/VARCHAR(200);
                       single-char flag: CHAR(1);
                       amounts/balances: DECIMAL(18,2); counts/ids: INT;
                       dates: DATE.
  - key_type         : exactly one of — "Business Key" or "Attribute".
                       (Do NOT emit the surrogate key here — the exporter
                       adds the Surrogate Key row automatically.)
  - nullable         : "No" for the business key; "Yes" for optional
                       attributes (unless clearly mandatory).
  - default_value    : value when the source is NULL — 'Unknown' for text,
                       0 for numbers, or "N/A" if not applicable.
  - lookup_dimension : "N/A" (only fact foreign keys use this field).

For each base_measure also add:
  - target_data_type : DECIMAL(18,2) for amounts/balances, INT for counts.
  - default_value    : 0 (measures default to zero, never NULL).
  - transformation : e.g. "SUM(COALESCE(AMT_LCL, 0))"
  - data_quality   : e.g. "NOT NULL · ≥ 0 · decimal(18,2)"

═══════════════════════════════════════════════════════════
STEP 8B — JOIN RULES & PER-TABLE SOURCE TABLES
═══════════════════════════════════════════════════════════
For EACH fact and EACH dimension, populate two fields:

  "source_tables": the exact base tables (FROM/JOIN, full names) that
  feed THIS target table — a subset of the global source_tables. Use
  ONLY real base tables, never a CTE / derived-table / subquery alias.

  "join_rules": one entry per JOIN used to build this target:
    - primary_source_table   : left/base table (full name)
    - secondary_source_table : joined table (full name)
    - join_type              : INNER JOIN | LEFT JOIN | RIGHT JOIN
    - join_condition         : the REAL ON predicate with real columns,
                               e.g. "D_Account.Branch_Id = D_Branch.Branch_Id"
    - filter_condition       : relevant WHERE for this join, else "N/A"
    - purpose                : why the join exists, in plain words
                               (e.g. "Get branch name for each account")
  If a target has a single source table and no joins, use [] for
  join_rules. Resolve every table/column through the CTEs to the real
  base tables — never cite D1 / Union1 / subquery aliases.

═══════════════════════════════════════════════════════════
STEP 9 — STAR SCHEMA VALIDATION
═══════════════════════════════════════════════════════════
Before output verify:
  1. All source tables included?
  2. All dimensions identified?
  3. DIM_DATE created?
  4. All measures captured?
  5. EVERY GROUP BY column mapped to a dimension or degenerate dim?
  6. EVERY CASE-classification column turned into a dimension?
  7. EVERY source table used by at least one dimension/fact?
  8. No CTE / alias used as a source_table?
  9. All foreign keys created (one per dimension)?
 10. No "Direct copy" on any CASE/IIF-derived column — the FULL
     CASE expression is shown in its transformation?
 11. Every source_column is a REAL base column (no D1.C0 / C5 alias codes)?
 12. Every fact and dimension has source_tables + join_rules populated
     (join_rules may be [] only when the target has a single source table)?
 13. Grain derived ONLY from THIS query's GROUP BY — not copied from any
     example, and with NO measures / presentation columns in it?
 14. case_analysis lists EVERY CASE/IIF in the SQL, each with its real
     origin and role; and EVERY entry whose role is "measure" or
     "classification_dimension" is reflected downstream with its FULL
     expression (no simplification, no "Direct copy")?
If ANY answer is NO → re-analyze and FIX before returning JSON.

Return VALID JSON ONLY. No markdown. No comments.
`;

/* ─────────────────────────────────────────────────────────
   USER PROMPT
───────────────────────────────────────────────────────── */
const USER_PROMPT = (sqlContent, fileName, reportContext = '') => `
Analyze the following Cognos SQL (migrated to Cloudera) and generate a COMPLETE Kimball dimensional model.

File Name: ${fileName}
${reportContext ? `
═══════════════════════════════════════════════════════════
REPORT METADATA (context only — NOT source tables)
═══════════════════════════════════════════════════════════
The following sheets come from the source report file. Use them ONLY
to understand the SQL below (column meanings, business names, filters,
lineage). Do NOT treat any table named here as a source_table unless it
also appears literally in the SQL FROM/JOIN. Ignore SSIS ".dtsx"
packages and presentation-only tables — they are NOT source tables.

${reportContext}
` : ''}
SQL:
${sqlContent}

Return ONLY this JSON (no other text):

{
  "report_name": "",
  "grain": "",

  "case_analysis": [
    {
      "expression": "the FULL CASE/IIF exactly as written in the SQL",
      "origin_table": "real base table its inputs come from (full name)",
      "origin_columns": "real base column(s) the CASE reads",
      "role": "measure | classification_dimension | filter | presentation | sort",
      "placed_in": "FACT_x.measure_name, or DIM_x.column_name, or 'not modeled'"
    }
  ],

  "facts": [
    {
      "name": "FACT_...",
      "grain": "",
      "fact_type": "Transaction | Periodic Snapshot | Accumulating",

      "base_measures": [
        {
          "name": "",
          "aggregation": "SUM|COUNT|AVG|MIN|MAX",
          "source_table": "base table this measure comes from (full name)",
          "source_column": "REAL base column (never an alias like D1.C0)",
          "transformation": "SUM(COALESCE(source_col, 0))",
          "target_data_type": "DECIMAL(18,2)",
          "default_value": "0",
          "data_quality": "NOT NULL · >= 0"
        }
      ],

      "derived_measures": [
        {
          "name": "",
          "formula": "",
          "data_quality": ""
        }
      ],

      "degenerate_dimensions": [],

      "foreign_keys": ["DIM_..."],

      "source_tables": ["base tables feeding this fact (full names)"],
      "join_rules": [
        {
          "primary_source_table": "",
          "secondary_source_table": "",
          "join_type": "INNER JOIN | LEFT JOIN",
          "join_condition": "real ON predicate with real columns",
          "filter_condition": "N/A",
          "purpose": ""
        }
      ]
    }
  ],

  "dimensions": [
    {
      "name": "DIM_...",
      "grain": "",
      "business_key": "",
      "surrogate_key": "",
      "scd_type": "Type 1 | Type 2",
      "attributes": [],
      "column_mappings": [
        {
          "target_column": "",
          "source_table": "base table this column comes from (full name)",
          "source_column": "REAL base column (never an alias like D1.C0)",
          "transformation": "",
          "target_data_type": "VARCHAR(50)",
          "key_type": "Business Key | Attribute",
          "nullable": "No | Yes",
          "default_value": "Unknown | 0 | N/A",
          "lookup_dimension": "N/A",
          "data_quality": ""
        }
      ],
      "source_table": "Database.Schema.TableName (must appear literally in SQL FROM/JOIN)",
      "source_tables": ["base tables feeding this dimension (full names)"],
      "join_rules": [
        {
          "primary_source_table": "",
          "secondary_source_table": "",
          "join_type": "INNER JOIN | LEFT JOIN",
          "join_condition": "real ON predicate with real columns",
          "filter_condition": "N/A",
          "purpose": ""
        }
      ],
      "inferred": false
    }
  ],

  "source_tables": ["every table from SQL FROM/JOIN — exact names only"],

  "star_schema_validation": {
    "all_source_tables_included": true,
    "all_dimensions_identified": true,
    "dim_date_created": true,
    "all_measures_identified": true,
    "grain_validated": true
  },

  "notes": ""
}
`;

/* ─────────────────────────────────────────────────────────
   QUALITY SCORE
───────────────────────────────────────────────────────── */
function calculateQuality(model) {
  let score = 0;
  if (model.report_name)                                         score += 10;
  if (model.grain)                                               score += 15;
  if (model.facts?.length > 0)                                   score += 20;
  if (model.dimensions?.length >= 4)                             score += 20;
  if (model.dimensions?.some(d => d.name === 'DIM_DATE'))        score += 10;
  if (model.source_tables?.length > 0)                           score += 10;
  if (model.star_schema_validation?.all_dimensions_identified)   score += 5;
  if (model.star_schema_validation?.all_measures_identified)     score += 5;
  if (model.star_schema_validation?.grain_validated)             score += 5;
  return score;
}

/* ─────────────────────────────────────────────────────────
   CASE-ANALYSIS RECONCILIATION (completeness guarantee)

   The model first enumerates every CASE/IIF in "case_analysis"
   (expression + role + real origin + intended placement). On big
   reports it sometimes drops a few of those when actually building
   the facts/dimensions. This pass replays case_analysis as the
   source of truth and guarantees that EVERY entry whose role is
   "measure" or "classification_dimension" is reflected downstream
   with its FULL expression — patching a simplified member in place,
   or adding the missing measure/column/dimension when needed.
   Anything role "filter" / "presentation" / "sort" / "not modeled"
   is intentionally left out of the star schema.
─────────────────────────────────────────────────────────── */
const _norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const _hasCase = (s) => /\bcase\b|\biif\b/i.test(String(s ?? ''));
const _lastIdent = (s) =>
  String(s ?? '')
    .split(/[^A-Za-z0-9_]+/)
    .filter(Boolean)
    .pop() || '';

/* Turn a placed_in ("DIM_x.Col" / "FACT_x.measure_name") into
   [objectName, memberName]; placeholders resolve from origin_columns. */
function _placement(placedIn, originColumns) {
  const s = _norm(placedIn);
  const dot = s.indexOf('.');
  const obj = (dot === -1 ? s : s.slice(0, dot)).trim();
  let member = dot === -1 ? '' : s.slice(dot + 1).trim();
  if (!member || /^(measure_name|column_name|measure|column|name)$/i.test(member)) {
    member = _lastIdent(originColumns);
  } else {
    member = _lastIdent(member) || member;
  }
  return [obj, member];
}

/* Wrap a bare CASE in the right aggregate for a measure transformation. */
function _asMeasureExpr(expr) {
  const e = _norm(expr);
  if (/^\s*(sum|count|avg|min|max|cast)\s*\(/i.test(e)) return e;
  const agg = /count/i.test(e) ? 'COUNT' : /avg/i.test(e) ? 'AVG' : 'SUM';
  return `${agg}(${e})`;
}

/* Short signature for a CASE branch — the first THEN literal, else a snippet. */
function _thenLabel(expr) {
  const m = String(expr ?? '').match(/then\s+'([^']{1,40})'/i);
  if (m) return m[1];
  return _norm(expr).slice(0, 40);
}

/* Make `desired` unique against a set of existing lower-cased names. */
function _uniqueName(existingLower, desired) {
  let base = String(desired || '').trim() || 'Value';
  if (!existingLower.has(base.toLowerCase())) return base;
  for (let i = 2; i < 100; i++) {
    const cand = `${base}_${i}`;
    if (!existingLower.has(cand.toLowerCase())) return cand;
  }
  return `${base}_${Date.now()}`;
}

/* Canonical signature of a CASE — collapses cosmetic differences so the same
   logic written two ways compares equal: drops COUNT/SUM DISTINCT, strips
   "Table." qualifiers, and removes all non-alphanumerics. Used to detect
   whether an expression is ALREADY reflected downstream before injecting. */
function _canon(s) {
  let e = String(s ?? '');
  const i = e.search(/\bcase\b|\biif\b/i);
  if (i >= 0) e = e.slice(i);
  return e
    .replace(/\b(count|sum|avg|min|max)\s*\(\s*distinct\b/gi, '$1(')
    .replace(/\bdistinct\b/gi, '')
    .replace(/\b[A-Za-z_]\w*\s*\.\s*/g, '')   // strip Table. / alias. qualifiers
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

/* Alias codes like D1.C40 or a bare C0/C40 mean the model failed to trace the
   expression to a real base column — don't propagate that into the model. */
function _hasAliasCode(s) {
  const e = String(s ?? '');
  return /\b[a-z]{1,2}\d+\s*\.\s*[a-z]\d+\b/i.test(e) || /\bc\d{1,3}\b/i.test(e);
}

/* A CASE that returns quoted string labels is a classification flag, not a
   numeric measure — guard against wrapping it in SUM()/COUNT(). */
function _isFlagMeasure(role, expr) {
  return /measure/.test(role) && /then\s+'/i.test(String(expr ?? ''));
}

/* Collapse members inside one object whose CASE expression is byte-identical
   (after whitespace/case normalisation) to an earlier member's — the model
   sometimes emits the SAME classification column twice under two names
   (e.g. Gender / Gender_Description). EXACT-string only: a base measure and a
   derived measure that merely share a CASE fragment have different full
   expressions and are NOT merged. Keeps the first, drops later copies. */
function _collapseDupCase(items, exprOf, nameOf, dropped) {
  if (!Array.isArray(items)) return items;
  const seen = new Map();   // normalised CASE expr → kept member name
  const keep = [];
  for (const x of items) {
    const e = exprOf(x);
    if (_hasCase(e)) {
      const k = _norm(e).toLowerCase();
      if (seen.has(k)) { dropped.push(`${nameOf(x)} (=${seen.get(k)})`); continue; }
      seen.set(k, nameOf(x));
    }
    keep.push(x);
  }
  return keep;
}

/* STRONG date-logic signal in the SQL — date FUNCTIONS or snapshot/period
   keywords, not a bare "date" substring (which appears in ordinary column
   names). Used to decide whether a missing DIM_DATE is a real omission. */
function _hasDateLogic(sql) {
  return /\b(DATEADD|DATEDIFF|DATE_ADD|DATE_SUB|DATE_DIFF|CURRENT_TIMESTAMP|CURRENT_DATE|GETDATE|SYSDATE|TO_DATE|ADD_MONTHS|MONTHS_BETWEEN|TRUNC\s*\(\s*[^)]*\b(day|month|year)\b|EXTRACT\s*\(|DATE_TRUNC|SNAPSHOT|\bMTD\b|\bYTD\b|Date_Opened|Date_Closed|Reporting_Date|Snapshot_Date)\b/i.test(String(sql || ''));
}

/* Standard inferred DIM_DATE (Kimball) — used when the SQL clearly has date
   logic but the model failed to build the mandatory date dimension. The
   surrogate-key row is added by the exporter, so only business key +
   calendar attributes are listed here. */
function _buildInferredDimDate() {
  const col = (target_column, target_data_type, key_type, transformation) => ({
    target_column, source_table: 'ETL Generated', source_column: 'Reporting/Snapshot date',
    transformation, target_data_type, key_type, nullable: key_type === 'Business Key' ? 'No' : 'Yes',
    default_value: key_type === 'Business Key' ? 'N/A' : '0', lookup_dimension: 'N/A',
    data_quality: 'Calendar attribute · NOT NULL · valid date range',
  });
  return {
    name: 'DIM_DATE', grain: 'One row per calendar day', business_key: 'Full_Date',
    surrogate_key: 'Date_SK', scd_type: 'Type 1', attributes: [],
    column_mappings: [
      col('Full_Date', 'DATE', 'Business Key', 'CAST(reporting/snapshot date AS DATE)'),
      col('Year', 'INT', 'Attribute', 'YEAR(Full_Date)'),
      col('Quarter', 'INT', 'Attribute', 'QUARTER(Full_Date)'),
      col('Month', 'INT', 'Attribute', 'MONTH(Full_Date)'),
      col('Month_Name', 'VARCHAR(20)', 'Attribute', "DATE_FORMAT(Full_Date, 'MMMM')"),
      col('Day', 'INT', 'Attribute', 'DAY(Full_Date)'),
      col('Day_Of_Week', 'VARCHAR(20)', 'Attribute', "DATE_FORMAT(Full_Date, 'EEEE')"),
    ],
    source_table: '⚠ Recommended – no source table in SQL',
    source_tables: [], join_rules: [], inferred: true, _reconciled: true,
  };
}

export function reconcileCaseAnalysis(model, sqlContent = '') {
  if (!model || typeof model !== 'object') return model;
  model.facts = Array.isArray(model.facts) ? model.facts : [];
  model.dimensions = Array.isArray(model.dimensions) ? model.dimensions : [];

  const ca = Array.isArray(model.case_analysis) ? model.case_analysis : [];
  if (!ca.length && !sqlContent) return model;

  // Index every CASE already reflected downstream, by CANONICAL signature so
  // cosmetic rewrites (DISTINCT, "Table." qualifiers) still match. A member may
  // WRAP the raw CASE (SUM(CASE…)), so substring match on the canon is allowed.
  const canonSet = [];
  const injectedCanon = new Set();
  // "member names that already carry a CASE" — used to fold extra branches of
  // the SAME classification attribute (one category column, many values) into
  // that column instead of duplicating it, even across dimensions.
  const memberCaseNames = new Set();
  const remember = (s) => { if (_hasCase(s)) canonSet.push(_canon(s)); };
  model.facts.forEach((f) => {
    (f.base_measures || []).forEach((x) => {
      remember(x.transformation);
      if (_hasCase(x.transformation)) memberCaseNames.add(_lastIdent(x.name).toLowerCase());
    });
    (f.derived_measures || []).forEach((x) => {
      remember(x.formula);
      if (_hasCase(x.formula)) memberCaseNames.add(_lastIdent(x.name).toLowerCase());
    });
  });
  model.dimensions.forEach((d) =>
    (d.column_mappings || []).forEach((c) => {
      remember(c.transformation);
      if (_hasCase(c.transformation)) memberCaseNames.add(_lastIdent(c.target_column).toLowerCase());
    }),
  );
  const isReflected = (expr) => {
    const c = _canon(expr);
    if (!c) return true;
    if (injectedCanon.has(c)) return true;
    return canonSet.some((r) => r === c || r.includes(c));
  };

  const injected = [];
  const mergedBranches = new Map();   // target → [THEN-labels] consolidated onto one member
  ca.forEach((e) => {
    const role = String(e?.role ?? '').toLowerCase();
    if (!/measure|classification/.test(role)) return;      // filters/presentation/sort → skip
    const expr = e?.expression;
    if (!_hasCase(expr)) return;                            // nothing to preserve
    if (_hasAliasCode(expr)) return;                        // untraced alias → don't propagate
    if (_isFlagMeasure(role, expr)) return;                 // Y/N label mis-tagged as a measure
    if (isReflected(expr)) return;                          // already built — good

    const [objName, member] = _placement(e.placed_in, e.origin_columns);
    const srcTable = _norm(e.origin_table);
    const srcCol = _norm(e.origin_columns);

    // Classification: if a column with this name already carries a CASE anywhere
    // in the model, this is another value branch of that ONE category attribute
    // (Kimball: one column, many values) — record the branch as a note instead
    // of duplicating the column. Measures are NOT deduped this way: two CASEs
    // over the same source column (balance by suffix vs by type) are different
    // measures and must both survive.
    const memberKey = _lastIdent(member).toLowerCase();
    if (/classification/.test(role) && member && memberCaseNames.has(memberKey)) {
      const label = _thenLabel(expr);
      if (label) {
        const arr = mergedBranches.get(memberKey) || [];
        if (!arr.includes(label)) arr.push(label);
        mergedBranches.set(memberKey, arr);
      }
      injectedCanon.add(_canon(expr));
      return;
    }

    if (/measure/.test(role)) {
      let fact = model.facts.find((f) => _norm(f.name).toLowerCase() === objName.toLowerCase());
      if (!fact) fact = model.facts[0];
      if (!fact) return;                                    // no fact to hang it on — leave it
      fact.base_measures = Array.isArray(fact.base_measures) ? fact.base_measures : [];
      // Patch a simplified measure that lost its CASE (match by name/source col).
      const stale = fact.base_measures.find(
        (m) => !_hasCase(m.transformation) && member &&
          (_lastIdent(m.source_column) === _lastIdent(srcCol) ||
           _lastIdent(m.name) === member),
      );
      if (stale) {
        stale.transformation = _asMeasureExpr(expr);
        stale.source_table = stale.source_table || srcTable;
        stale.source_column = stale.source_column || srcCol;
        stale._reconciled = true;
      } else {
        const taken = new Set((fact.base_measures || []).map((m) => String(m.name || '').toLowerCase()));
        const name = _uniqueName(taken, member || 'Conditional_Measure');
        fact.base_measures.push({
          name,
          aggregation: /count/i.test(expr) ? 'COUNT' : /avg/i.test(expr) ? 'AVG' : 'SUM',
          source_table: srcTable,
          source_column: srcCol,
          transformation: _asMeasureExpr(expr),
          target_data_type: 'DECIMAL(18,2)',
          default_value: '0',
          data_quality: 'Conditional (CASE) measure recovered from source SQL',
          _reconciled: true,
        });
      }
      injected.push(`${objName || fact.name}.${member} (measure)`);
    } else {
      let dim = model.dimensions.find((d) => _norm(d.name).toLowerCase() === objName.toLowerCase());
      if (!dim) {
        dim = {
          name: objName || 'DIM_Classification',
          grain: '',
          business_key: '',
          surrogate_key: `${objName || 'DIM_Classification'}_SK`,
          scd_type: 'Type 1',
          attributes: [],
          column_mappings: [],
          source_table: srcTable,
          source_tables: srcTable ? [srcTable] : [],
          join_rules: [],
          inferred: true,
          _reconciled: true,
        };
        model.dimensions.push(dim);
        // Wire it to a fact so the star stays connected.
        const f0 = model.facts[0];
        if (f0) {
          f0.foreign_keys = Array.isArray(f0.foreign_keys) ? f0.foreign_keys : [];
          if (!f0.foreign_keys.some((k) => _norm(k).toLowerCase() === dim.name.toLowerCase())) {
            f0.foreign_keys.push(dim.name);
          }
        }
      }
      dim.column_mappings = Array.isArray(dim.column_mappings) ? dim.column_mappings : [];
      const stale = dim.column_mappings.find(
        (c) => !_hasCase(c.transformation) && member &&
          (_lastIdent(c.target_column) === member || _lastIdent(c.source_column) === _lastIdent(srcCol)),
      );
      if (stale) {
        stale.transformation = _norm(expr);
        stale.source_table = stale.source_table || srcTable;
        stale.source_column = stale.source_column || srcCol;
        stale._reconciled = true;
      } else {
        const taken = new Set((dim.column_mappings || []).map((c) => String(c.target_column || '').toLowerCase()));
        const name = _uniqueName(taken, member || 'Classification');
        dim.column_mappings.push({
          target_column: name,
          source_table: srcTable,
          source_column: srcCol,
          transformation: _norm(expr),
          target_data_type: 'VARCHAR(50)',
          key_type: 'Attribute',
          nullable: 'Yes',
          default_value: 'Unknown',
          lookup_dimension: 'N/A',
          data_quality: 'Classification (CASE) attribute recovered from source SQL',
          _reconciled: true,
        });
      }
      injected.push(`${dim.name}.${member} (classification)`);
    }
    injectedCanon.add(_canon(expr));
    if (member) memberCaseNames.add(memberKey);
  });

  // Drop any exact-duplicate CASE members the model emitted (same logic, two
  // names) — done last so it also cleans up anything the reconciliation added.
  const dropped = [];
  model.facts.forEach((f) => {
    f.base_measures = _collapseDupCase(f.base_measures, (x) => x.transformation, (x) => x.name, dropped);
    f.derived_measures = _collapseDupCase(f.derived_measures, (x) => x.formula, (x) => x.name, dropped);
  });
  model.dimensions.forEach((d) => {
    d.column_mappings = _collapseDupCase(d.column_mappings, (x) => x.transformation, (x) => x.target_column, dropped);
  });

  // DIM_DATE is mandatory whenever the SQL has real date logic (STEP 5). The
  // model usually builds it but occasionally drops it on large date-driven
  // reports — guarantee it here and wire it to the fact so the star is complete.
  let addedDimDate = false;
  const hasDimDate = model.dimensions.some((d) => /dim_date/i.test(d.name || ''));
  if (!hasDimDate && model.facts.length && _hasDateLogic(sqlContent)) {
    model.dimensions.push(_buildInferredDimDate());
    const f0 = model.facts[0];
    f0.foreign_keys = Array.isArray(f0.foreign_keys) ? f0.foreign_keys : [];
    if (!f0.foreign_keys.some((k) => /dim_date/i.test(String(k)))) f0.foreign_keys.push('DIM_DATE');
    addedDimDate = true;
  }

  const notes = [];
  if (addedDimDate) {
    notes.push('Added mandatory DIM_DATE (inferred) — the SQL contains date logic but the model omitted the date dimension.');
  }
  if (injected.length) {
    notes.push(
      `Auto-reconciled ${injected.length} CASE expression(s) from case_analysis that were not carried into the model: ${injected.join('; ')}.`,
    );
  }
  if (dropped.length) {
    notes.push(`Removed ${dropped.length} duplicate CASE member(s) with identical logic: ${dropped.join('; ')}.`);
  }
  if (mergedBranches.size) {
    mergedBranches.forEach((labels, key) => {
      notes.push(`${key} consolidates ${labels.length + 1} source CASE branch(es): ${labels.join(', ')}.`);
    });
  }
  if (notes.length) {
    const tag = notes.join('\n');
    model.notes = model.notes ? `${model.notes}\n${tag}` : tag;
  }
  return model;
}

/* ─────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────── */
export async function analyzeQuery(sqlContent, fileName, reportContext = '') {
  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 12000,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: USER_PROMPT(sqlContent, fileName, reportContext) },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const raw  = data.choices?.[0]?.message?.content ?? '';

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('The API did not return valid JSON');

  const result  = reconcileCaseAnalysis(JSON.parse(jsonMatch[0]), sqlContent);
  const quality = calculateQuality(result);

  console.log('═══════════════════════════════════════');
  console.log(`📄 Report     : ${result.report_name}`);
  console.log(`⭐ Quality    : ${quality}%`);
  console.log(`📊 Facts      : ${result.facts?.length || 0}`);
  console.log(`📚 Dimensions : ${result.dimensions?.length || 0}`);
  console.log(`🗄️  Sources    : ${result.source_tables?.length || 0}`);
  console.log('═══════════════════════════════════════');

  result.quality_score = quality;
  return result;
}
