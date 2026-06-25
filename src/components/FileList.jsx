import styles from './FileList.module.css';

export default function FileList({ files, activeIdx, onSelect, onRemove, statuses }) {
  return (
    <div className={styles.list}>
      {files.map((f, i) => {
        const status = statuses[i] ?? 'idle';
        return (
          <div
            key={i}
            className={`${styles.item} ${activeIdx === i ? styles.active : ''}`}
            onClick={() => onSelect(i)}
          >
            <div className={styles.left}>
              <span className={styles.num}>{i + 1}</span>
              <div className={styles.info}>
                <span className={styles.name}>{f.fileName}</span>
                <span className={styles.size}>{(f.content.length / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <div className={styles.right}>
              {status === 'idle'    && <span className="badge badge-blue">Ready</span>}
              {status === 'loading' && <span className="badge badge-warn">⟳ Analyzing...</span>}
              {status === 'done'    && <span className="badge badge-teal">✓ Done</span>}
              {status === 'error'   && <span className="badge badge-red">✕ Error</span>}
              <button
                className="btn-ghost"
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                title="Remove"
                style={{ padding: '2px 8px', fontSize: '1rem' }}
              >×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
