import { useRef, useState } from 'react';
import { transcribeAudio, getAssistantReply, synthesizeSpeech } from '../utils/voiceAssistant';
import styles from './CallCenterAssistant.module.css';

const STATUS_LABEL = {
  idle: 'اضغط على الميكروفون وتكلّم',
  recording: 'يسجّل... اضغط للإيقاف',
  transcribing: 'يفهم كلامك...',
  thinking: 'يجهّز الرد...',
  speaking: 'يتكلم...',
  error: 'صار خطأ، جرّب مرة ثانية',
};

export default function CallCenterAssistant() {
  const [status, setStatus] = useState('idle');
  const [messages, setMessages] = useState([]); // [{role: 'user'|'assistant', content}]
  const [errorMsg, setErrorMsg] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        handleRecordingStopped();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
    } catch (err) {
      setStatus('error');
      setErrorMsg('ما قدرنا نوصل للميكروفون: ' + err.message);
    }
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  const handleRecordingStopped = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    try {
      setStatus('transcribing');
      const userText = await transcribeAudio(blob);
      if (!userText) { setStatus('idle'); return; }

      const nextHistory = [...messages, { role: 'user', content: userText }];
      setMessages(nextHistory);

      setStatus('thinking');
      const replyText = await getAssistantReply(nextHistory);
      setMessages((m) => [...m, { role: 'assistant', content: replyText }]);

      setStatus('speaking');
      const audioUrl = await synthesizeSpeech(replyText);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => setStatus('idle');
        await audioRef.current.play();
      } else {
        setStatus('idle');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const toggleRecording = () => {
    if (status === 'recording') stopRecording();
    else if (status === 'idle' || status === 'error') startRecording();
  };

  const busy = status === 'transcribing' || status === 'thinking' || status === 'speaking';

  return (
    <div className={styles.wrap}>
      <div className={styles.transcript}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            ابدأ المكالمة بالضغط على زر الميكروفون وتكلّم بأي طلب أو استفسار.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? styles.bubbleUser : styles.bubbleBot}>
            <span className={styles.bubbleRole}>{m.role === 'user' ? 'العميل' : 'المساعد'}</span>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

      <div className={styles.controls}>
        <button
          className={`${styles.micButton} ${status === 'recording' ? styles.micActive : ''}`}
          onClick={toggleRecording}
          disabled={busy}
          aria-label={status === 'recording' ? 'إيقاف التسجيل' : 'ابدأ التسجيل'}
        >
          {status === 'recording' ? '⏹' : '🎙️'}
        </button>
        <span className={styles.statusLabel}>{STATUS_LABEL[status]}</span>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
