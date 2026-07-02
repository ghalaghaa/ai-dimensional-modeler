import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 100;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/send', async (req, res) => {
  const { recipients, subject, message } = req.body ?? {};

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'أدخل بريد إلكتروني واحد على الأقل.' });
  }
  if (recipients.length > MAX_RECIPIENTS) {
    return res.status(400).json({ error: `الحد الأقصى ${MAX_RECIPIENTS} مستلم في المرة الواحدة.` });
  }
  const invalid = recipients.filter((r) => !EMAIL_RE.test(r));
  if (invalid.length > 0) {
    return res.status(400).json({ error: `بريد غير صالح: ${invalid.join(', ')}` });
  }
  if (!subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'الموضوع والرسالة مطلوبان.' });
  }

  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: fromAddress,
      bcc: recipients,
      subject,
      text: message,
    });
    res.json({ ok: true, sent: recipients.length });
  } catch (err) {
    console.error('Send failed:', err.message);
    res.status(502).json({ error: 'تعذر إرسال الإيميل. تحقق من إعدادات SMTP.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Mass email sender running on http://localhost:${port}`));
