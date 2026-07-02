// Serverless proxy (Vercel) for speech-to-text.
// Keeps GROQ_API_KEY on the SERVER — the key is never sent to the browser.
// The client posts a multipart/form-data audio file here; we forward it as-is
// (same content-type, including the multipart boundary) to Groq's Whisper endpoint.
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server' });
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const upstream = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'],
        Authorization: `Bearer ${key}`,
      },
      body,
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch (e) {
    res.status(502).json({ error: `Proxy failed: ${e.message}` });
  }
}
