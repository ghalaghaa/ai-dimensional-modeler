// Voice call-center assistant pipeline:
//   mic audio -> Groq Whisper (STT) -> Groq LLM (reply) -> NAMAA-Saudi-TTS (speech)
const CHAT_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';
const STT_MODEL = import.meta.env.VITE_GROQ_STT_MODEL || 'whisper-large-v3-turbo';
const TTS_SERVICE_URL = import.meta.env.VITE_TTS_SERVICE_URL || 'http://localhost:8000';

export const SYSTEM_PROMPT = `أنت موظف في مركز اتصال (كول سنتر) لخدمة العملاء.
تتكلم باللهجة السعودية الدارجة، بأسلوب ودود ومحترف ومختصر.
ردودك بتُقرأ بصوت مسموع، فراعِ الآتي:
- لا تستخدم أي تنسيق نصي (بدون **، بدون قوائم، بدون عناوين، بدون رموز).
- جمل قصيرة وواضحة تصلح للنطق.
- إذا ما فهمت طلب العميل، اسأله يوضح بأدب.
- إذا الطلب خارج نطاقك، اعتذر بلطف واقترح تحويله لموظف بشري.`;

export async function transcribeAudio(blob) {
  const form = new FormData();
  form.append('file', blob, 'audio.webm');
  form.append('model', STT_MODEL);
  form.append('language', 'ar');

  const response = await fetch('/api/stt', { method: 'POST', body: form });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`STT error (${response.status}): ${err}`);
  }
  const data = await response.json();
  return (data.text ?? '').trim();
}

export async function getAssistantReply(history) {
  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CHAT_MODEL,
      max_tokens: 300,
      temperature: 0.4,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Chat error (${response.status}): ${err}`);
  }
  const data = await response.json();
  return (data.choices?.[0]?.message?.content ?? '').trim();
}

export async function synthesizeSpeech(text) {
  const response = await fetch(`${TTS_SERVICE_URL}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language_id: 'ar' }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TTS error (${response.status}): ${err}`);
  }
  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}
