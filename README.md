# مولّد الموديل الأبعادي — AI Dimensional Modeler

## الإعداد السريع

### 1. مفتاح الـ API

افتح ملف `.env` وأضف مفتاح Anthropic الخاص بك:

```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx
```

### 2. تثبيت وتشغيل

```bash
npm install
npm run dev
```

افتح المتصفح على: http://localhost:5173

---

## كيفية الاستخدام

1. **ارفع ملفات SQL** — اسحب وأفلت ملفات `.sql` أو اختارها من الجهاز (أي عدد)
2. **معاينة** — شاهد محتوى الكويري قبل التحليل
3. **تحليل** — اضغط "تحليل" لملف واحد، أو "تحليل الكل" لجميع الملفات
4. **النتيجة** — Facts وDimensions مع المقاييس والمفاتيح ونوع SCD
5. **تصدير** — JSON أو Excel
---

## 🎙️ المساعد الصوتي للكول سنتر (Voice Assistant)

تبويب جديد بجانب "SQL Analyzer" في الأعلى يشغّل بوت محادثة صوتي كامل باللهجة
السعودية: تسجّل صوتك ← يتحول لنص (Groq Whisper) ← يرد عليك ذكاء اصطناعي
(Groq LLM) ← يتحول الرد لصوت سعودي طبيعي بموديل
[NAMAA-Saudi-TTS](https://huggingface.co/NAMAA-Space/NAMAA-Saudi-TTS).

**قبل التجربة** لازم تشغّل خدمة الـ TTS بشكل منفصل (تحتاج GPU/اتصال إنترنت
لتحميل الموديل) — راجع [`tts_service/README.md`](./tts_service/README.md)،
وعيّن `VITE_TTS_SERVICE_URL` في `.env` على رابطها.

---

