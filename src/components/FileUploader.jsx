import { useRef, useState } from 'react';
import styles from './FileUploader.module.css';

export default function FileUploader({ onFilesLoaded }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const readFiles = (fileList) => {
    const sqlFiles = Array.from(fileList).filter((f) => f.name.endsWith('.sql'));
    if (!sqlFiles.length) return alert('Please upload .sql files only');

    const readers = sqlFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ fileName: file.name, content: e.target.result });
          reader.readAsText(file, 'utf-8');
        })
    );
    Promise.all(readers).then(onFilesLoaded);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    readFiles(e.dataTransfer.files);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".sql"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => readFiles(e.target.files)}
        />
        <div className={styles.icon}>⬆</div>
        <p className={styles.main}>Drag & drop <strong>.sql</strong> files here</p>
        <p className={styles.sub}>or click to browse — upload any number of files</p>
        <div className={styles.hint}>
          <span className="badge badge-gold">Cognos SQL</span>
          <span className="badge badge-teal">Cloudera HiveQL</span>
          <span className="badge badge-blue">Any SQL</span>
        </div>
      </div>
    </div>
  );
}
