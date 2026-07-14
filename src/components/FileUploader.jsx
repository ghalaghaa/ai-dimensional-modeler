import { useRef, useState } from 'react';
import styles from './FileUploader.module.css';
import { ACCEPT, isSupported, readUploadedFiles } from '../utils/fileIntake';

export default function FileUploader({ onFilesLoaded }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const readFiles = (fileList) => {
    const supported = Array.from(fileList).filter((f) => isSupported(f.name));
    if (!supported.length) return alert('Please upload .sql / .xlsx report files or .dtsx SSIS packages');

    readUploadedFiles(fileList).then((items) => {
      const usable = items.filter((it) => it.content);
      if (!usable.length) return alert('Could not find any SQL in the uploaded file(s)');
      onFilesLoaded(usable);
    });
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
          accept={ACCEPT}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => readFiles(e.target.files)}
        />
        <div className={styles.icon}>⬆</div>
        <p className={styles.main}>Drag & drop <strong>.sql</strong> or <strong>.xlsx</strong> files here</p>
        <p className={styles.sub}>or click to browse — upload any number of files</p>
        <div className={styles.hint}>
          <span className="badge badge-gold">Cognos SQL</span>
          <span className="badge badge-teal">Cloudera HiveQL</span>
          <span className="badge badge-blue">Report .xlsx</span>
          <span className="badge badge-teal">SSIS .dtsx/.conmgr</span>
        </div>
      </div>
    </div>
  );
}
