import { useState } from 'react';
import styles from './QueryPreview.module.css';

export default function QueryPreview({ file }) {
  const [expanded, setExpanded] = useState(false);
  const lines = file.content.split('\n');
  const preview = lines.slice(0, 20).join('\n');

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Query Preview</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-blue">{lines.length} lines</span>
          <span className="badge badge-gold">{(file.content.length / 1024).toFixed(1)} KB</span>
        </div>
      </div>
      <pre className={styles.code}>
        {expanded ? file.content : preview}
        {!expanded && lines.length > 20 && <span className={styles.fade}>...</span>}
      </pre>
      {lines.length > 20 && (
        <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Collapse' : `▼ Show all (${lines.length} lines)`}
        </button>
      )}
    </div>
  );
}
