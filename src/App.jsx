import { useState } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';
import QueryPreview from './components/QueryPreview';
import ModelResult from './components/ModelResult';
import { analyzeQuery } from './utils/claudeApi';
import { exportExcel } from './utils/exportUtils';
import { ACCEPT, readUploadedFiles } from './utils/fileIntake';
import { emptyLineage, addLineageFiles } from './utils/ssisLineage';
import styles from './App.module.css';

export default function App() {
  const [files, setFiles] = useState([]);         // [{fileName, content}]
  const [statuses, setStatuses] = useState([]);   // 'idle' | 'loading' | 'done' | 'error'
  const [results, setResults] = useState([]);     // [{fileName, result, error}]
  const [lineage, setLineage] = useState(emptyLineage()); // SSIS mart → source-table lineage
  const [activeIdx, setActiveIdx] = useState(0);
  const [tab, setTab] = useState('preview');      // 'preview' | 'model'

  const runAnalysis = async (file, idx) => {
    setStatuses((s) => s.map((v, i) => (i === idx ? 'loading' : v)));
    setTab('model');
    try {
      const result = await analyzeQuery(file.content, file.fileName, file.context);
      setResults((r) => r.map((v, i) => (i === idx ? { fileName: file.fileName, content: file.content, result } : v)));
      setStatuses((s) => s.map((v, i) => (i === idx ? 'done' : v)));
    } catch (err) {
      setResults((r) => r.map((v, i) => (i === idx ? { fileName: file.fileName, error: err.message } : v)));
      setStatuses((s) => s.map((v, i) => (i === idx ? 'error' : v)));
    }
  };

  // عند إفلات الملف: يبدأ التحليل تلقائياً مباشرة.
  // .dtsx/.conmgr (وكذلك SQL load scripts التي تحتوي INSERT INTO) تُوجَّه
  // إلى خريطة الـ lineage بدلاً من التحليل — هي مصدر "الجداول الأصلية".
  const handleFilesLoaded = (incoming) => {
    const newFiles = [];
    const lineageFiles = [];
    incoming.forEach((f) => {
      if (f.kind === 'dtsx' || f.kind === 'conmgr') { lineageFiles.push(f); return; }
      if (f.kind === 'sql' && /\b(insert\s+into|merge\s+into|merge)\b/i.test(f.content)) {
        lineageFiles.push(f); // load script, not a report query — don't analyze it
        return;
      }
      newFiles.push(f);
    });
    if (lineageFiles.length) setLineage((prev) => addLineageFiles(prev, lineageFiles));
    if (!newFiles.length) return;
    const base = files.length;
    setFiles((prev) => [...prev, ...newFiles]);
    setStatuses((prev) => [...prev, ...Array(newFiles.length).fill('idle')]);
    setResults((prev) => [...prev, ...Array(newFiles.length).fill(null)]);
    setActiveIdx(base);
    setTab('model');
    (async () => {
      for (let i = 0; i < newFiles.length; i++) {
        await runAnalysis(newFiles[i], base + i);
      }
    })();
  };

  const handleRemove = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setStatuses((prev) => prev.filter((_, i) => i !== idx));
    setResults((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx(0);
  };

  const analyzeOne = (idx) => runAnalysis(files[idx], idx);

  const analyzeAll = async () => {
    for (let i = 0; i < files.length; i++) {
      setActiveIdx(i);
      await runAnalysis(files[i], i);
    }
  };

  const doneResults = results.filter((r) => r?.result);
  const activeFile = files[activeIdx];
  const activeResult = results[activeIdx];

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        {/* ── Upload zone (shown when no files) ── */}
        {files.length === 0 && (
          <div className={styles.uploadZone}>
            <div className="card" style={{ maxWidth: 680, width: '100%' }}>
              <FileUploader onFilesLoaded={handleFilesLoaded} />
              {lineage.entries.length > 0 && (
                <p style={{ marginTop: 12, textAlign: 'center' }}>
                  🔗 SSIS Lineage loaded: {lineage.entries.length} table mapping(s) from {lineage.packageNames.size} package(s)
                  — now upload the report SQL files
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Workspace (shown when files exist) ── */}
        {files.length > 0 && (
          <div className={styles.workspace}>
            {/* Left sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>Uploaded Files</span>
                <span className="badge badge-blue">{files.length}</span>
              </div>

              <FileList
                files={files}
                activeIdx={activeIdx}
                onSelect={(i) => { setActiveIdx(i); setTab(results[i] ? 'model' : 'preview'); }}
                onRemove={handleRemove}
                statuses={statuses}
              />

              <div className={styles.sidebarActions}>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => document.getElementById('add-more')?.click()}>
                  + Add Files
                </button>
                <input id="add-more" type="file" accept={ACCEPT} multiple style={{ display: 'none' }}
                  onChange={(e) => {
                    readUploadedFiles(e.target.files).then((items) => {
                      const usable = items.filter((it) => it.content);
                      if (usable.length) handleFilesLoaded(usable);
                    });
                    e.target.value = '';
                  }} />

                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={analyzeAll}
                  disabled={statuses.some(s => s === 'loading')}>
                  {statuses.some(s => s === 'loading') ? '⟳ Analyzing...' : '⚡ Analyze All'}
                </button>
              </div>

              {/* SSIS lineage */}
              {lineage.entries.length > 0 && (
                <div className={styles.exportBox}>
                  <p className={styles.exportLabel}>
                    🔗 SSIS Lineage: {lineage.entries.length} table mapping(s) from {lineage.packageNames.size} package(s)
                  </p>
                </div>
              )}

              {/* Export */}
              {doneResults.length > 0 && (
                <div className={styles.exportBox}>
                  <p className={styles.exportLabel}>Export Results ({doneResults.length})</p>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => exportExcel(doneResults, lineage)}>⬇ Export Excel</button>
                </div>
              )}
            </aside>

            {/* Main panel */}
            <div className={styles.panel}>
              {activeFile && (
                <>
                  <div className={styles.panelHeader}>
                    <div className={styles.fileName}>{activeFile.fileName}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className={`btn-ghost ${tab === 'preview' ? styles.tabActive : ''}`}
                        onClick={() => setTab('preview')}>SQL Preview</button>
                      <button className={`btn-ghost ${tab === 'model' ? styles.tabActive : ''}`}
                        onClick={() => setTab('model')}
                        disabled={!activeResult}>Dimensional Model</button>
                      <button className="btn-primary"
                        onClick={() => analyzeOne(activeIdx)}
                        disabled={statuses[activeIdx] === 'loading'}>
                        {statuses[activeIdx] === 'loading' ? '⟳ Analyzing...' : '⚡ Analyze'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.panelBody}>
                    {tab === 'preview' && <QueryPreview file={activeFile} />}

                    {tab === 'model' && !activeResult && (
                      <div className={styles.emptyState}>
                        Click <strong>Analyze</strong> to generate the dimensional model for this file
                      </div>
                    )}

                    {tab === 'model' && activeResult?.error && (
                      <div className={styles.errorBox}>
                        <strong>Error:</strong> {activeResult.error}
                      </div>
                    )}

                    {tab === 'model' && activeResult?.result && (
                      <ModelResult result={activeResult.result} fileName={activeFile.fileName} />
                    )}

                    {statuses[activeIdx] === 'loading' && (
                      <div className={styles.loadingBox}>
                        <div className={styles.spinner} />
                        <span>AI is analyzing the query and building the dimensional model...</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
