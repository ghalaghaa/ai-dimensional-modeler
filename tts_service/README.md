# NAMAA Saudi TTS Service

خدمة صغيرة بـ FastAPI تُشغّل موديل [NAMAA-Space/NAMAA-Saudi-TTS](https://huggingface.co/NAMAA-Space/NAMAA-Saudi-TTS)
(نص → صوت باللهجة السعودية، مبني على Chatterbox Multilingual TTS، 0.5B). تُستخدم من
ميزة "🎙️ Voice Assistant" في التطبيق الرئيسي عشان تنطق ردود المساعد.

هذي الخدمة **منفصلة** عن نشر Vercel — لازم تشتغل على جهاز/سيرفر عنده:
- اتصال إنترنت (لتحميل أوزان الموديل من Hugging Face في أول تشغيل)
- بايثون 3.10+
- يُفضّل GPU (CUDA)؛ تشتغل على CPU لكن أبطأ بكثير

## التثبيت

```bash
cd tts_service
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

> إذا عندك GPU (CUDA)، ثبّت نسخة `torch`/`torchaudio` المطابقة لإصدار CUDA عندك
> من [pytorch.org](https://pytorch.org/get-started/locally/) **قبل** أو بدل السطر
> العام في `requirements.txt`.

## التشغيل

```bash
python app.py
# أو
uvicorn app:app --host 0.0.0.0 --port 8000
```

أول طلب `/synthesize` بيحمّل أوزان الموديل من Hugging Face (قد يأخذ وقت)، وبعدين
يبقى محمّل بالذاكرة للطلبات اللي بعده.

### متغيرات البيئة (اختيارية)

| المتغير | الافتراضي | الوصف |
|---|---|---|
| `TTS_DEVICE` | يُكتشف تلقائياً (cuda/mps/cpu) | إجبار جهاز معيّن |
| `ALLOWED_ORIGIN` | `*` | نطاقات CORS المسموحة (مثلاً رابط تطبيقك على Vercel) |
| `PORT` | `8000` | منفذ الخدمة |

## الـ API

### `GET /health`
```json
{ "status": "ok", "device": "cuda", "model_loaded": true }
```

### `POST /synthesize`
```json
{
  "text": "أهلاً وسهلاً، كيف أقدر أساعدك؟",
  "language_id": "ar",
  "audio_prompt_path": null
}
```
يرجع الرد صوت WAV مباشرة (`audio/wav`).

`audio_prompt_path` اختياري — مسار ملف WAV مرجعي موجود على نفس السيرفر
لاستنساخ/تقليد صوت معيّن (voice/style transfer)، حسب قدرات الموديل الأصلي.

## ربطها بالتطبيق الرئيسي

في `.env` الخاص بالواجهة (الجذر)، عيّن:

```
VITE_TTS_SERVICE_URL=http://localhost:8000
```

أو رابط السيرفر اللي تنشر عليه هذي الخدمة.

## قيود معروفة (من صفحة الموديل)

- عدم وجود تشكيل بالنص قد يأثر على دقة النطق.
- تطبيع الأرقام (numeric normalization) ما زال يحتاج تحسين في الإصدار الحالي.
