import styles from './ModelResult.module.css';

/* ── قسم عام ────────────────────────────────────────────── */
function Section({ title, badge, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}

/* ── بطاقة الحقيقة ──────────────────────────────────────── */
function FactCard({ fact }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.tableName}>{fact.name}</span>
        <span className="badge badge-teal">{fact.fact_type}</span>
      </div>
      <p className={styles.grain}>⬡ Grain: {fact.grain}</p>

      {/* Base measures */}
      {fact.base_measures?.length > 0 && (
        <div className={styles.tableWrap}>
          <p className={styles.tableLabel}>Base Measures</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Measure</th>
                <th>Aggregation</th>
                <th>Source Column</th>
                <th>Transformation</th>
                <th>Data Quality</th>
              </tr>
            </thead>
            <tbody>
              {fact.base_measures.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td><span className="badge badge-gold">{m.aggregation}</span></td>
                  <td className={styles.mono}>{m.source_column}</td>
                  <td className={styles.mono}>{m.transformation}</td>
                  <td>{m.data_quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Derived measures */}
      {fact.derived_measures?.length > 0 && (
        <div className={styles.tableWrap}>
          <p className={styles.tableLabel}>Derived Measures</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Measure</th>
                <th>Formula</th>
                <th>Data Quality</th>
              </tr>
            </thead>
            <tbody>
              {fact.derived_measures.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td className={styles.mono}>{m.formula}</td>
                  <td>{m.data_quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fact.foreign_keys?.length > 0 && (
        <div className={styles.fkRow}>
          <span className={styles.label}>Foreign Keys:</span>
          {fact.foreign_keys.map((fk, i) => (
            <span key={i} className="badge badge-blue">{fk}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── بطاقة البُعد ───────────────────────────────────────── */
function DimCard({ dim }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.tableName}>{dim.name}</span>
        {dim.inferred && <span className="badge badge-warn">Inferred — needs source</span>}
        <span className={`badge ${dim.scd_type === 'Type 2' ? 'badge-warn' : 'badge-blue'}`}>
          {dim.scd_type}
        </span>
      </div>
      <p className={styles.grain}>⬡ Grain: {dim.grain}</p>

      <div className={styles.keyRow}>
        <div className={styles.keyItem}>
          <span className={styles.label}>Business Key</span>
          <code className={styles.code}>{dim.business_key}</code>
        </div>
        <div className={styles.keyItem}>
          <span className={styles.label}>Surrogate Key</span>
          <code className={styles.code}>{dim.surrogate_key}</code>
        </div>
        <div className={styles.keyItem}>
          <span className={styles.label}>Source Table</span>
          <code className={styles.code}>{dim.source_table}</code>
        </div>
      </div>

      {/* Per-column transformation rules */}
      {dim.column_mappings?.length > 0 && (
        <div className={styles.tableWrap}>
          <p className={styles.tableLabel}>Transformation Rules</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Target Column</th>
                <th>Source Column</th>
                <th>Transformation</th>
                <th>Data Quality</th>
              </tr>
            </thead>
            <tbody>
              {dim.column_mappings.map((c, i) => (
                <tr key={i}>
                  <td className={styles.mono}>{c.target_column}</td>
                  <td className={styles.mono}>{c.source_column}</td>
                  <td className={styles.mono}>{c.transformation}</td>
                  <td>{c.data_quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* السمات — إذا ما في column_mappings */}
      {!dim.column_mappings?.length && dim.attributes?.length > 0 && (
        <div className={styles.attrWrap}>
          <span className={styles.label}>Attributes:</span>
          <div className={styles.attrList}>
            {dim.attributes.map((a, i) => (
              <span key={i} className={styles.attr}>{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── المكوّن الرئيسي ─────────────────────────────────────── */
export default function ModelResult({ result, fileName }) {
  if (!result) return null;

  return (
    <div className={styles.wrap}>

      {/* Report name and grain */}
      <div className={styles.grainBox}>
        <span className={styles.label}>Report:</span>
        <strong>{result.report_name ?? fileName}</strong>
        <span style={{ margin: '0 8px', color: 'var(--border)' }}>|</span>
        <span className={styles.label}>Fact Grain:</span>
        <span>{result.grain}</span>
      </div>

      {/* Fact tables */}
      <Section
        title="Fact Tables"
        badge={<span className="badge badge-teal">{result.facts?.length ?? 0} tables</span>}
      >
        {result.facts?.map((f, i) => <FactCard key={i} fact={f} />)}
      </Section>

      {/* Dimension tables */}
      <Section
        title="Dimension Tables"
        badge={<span className="badge badge-gold">{result.dimensions?.length ?? 0} dims</span>}
      >
        {result.dimensions?.map((d, i) => <DimCard key={i} dim={d} />)}
      </Section>

      {/* Source tables */}
      {result.source_tables?.length > 0 && (
        <Section
          title="Source Tables"
          badge={<span className="badge badge-blue">{result.source_tables.length}</span>}
        >
          <div className={styles.sourceList}>
            {result.source_tables.map((t, i) => (
              <code key={i} className={styles.sourceTag}>{t}</code>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}
