import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Local-dev equivalent of the Vercel serverless function in /api/groq.js.
// It runs inside the Vite (Node) dev process, so the key stays on the server
// side and is never exposed to the browser — same security model as production.
function groqDevProxy(key) {
  return {
    name: 'groq-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/groq', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
        if (!key) { res.statusCode = 500; res.end('GROQ_API_KEY (or VITE_GROQ_API_KEY) not set in .env'); return; }
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', async () => {
          try {
            const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
              body,
            });
            const text = await upstream.text();
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(text);
          } catch (e) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  }
}

// Local-dev equivalent of the Vercel serverless function in /api/stt.js.
// Forwards the raw multipart body (audio file) through to Groq's Whisper
// transcription endpoint unchanged, keeping GROQ_API_KEY on the server.
function sttDevProxy(key) {
  return {
    name: 'stt-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/stt', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
        if (!key) { res.statusCode = 500; res.end('GROQ_API_KEY (or VITE_GROQ_API_KEY) not set in .env'); return; }
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', async () => {
          try {
            const body = Buffer.concat(chunks);
            const upstream = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
              method: 'POST',
              headers: { 'Content-Type': req.headers['content-type'], Authorization: `Bearer ${key}` },
              body,
            });
            const text = await upstream.text();
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(text);
          } catch (e) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_*) for the dev proxy. These stay in the
  // Node process; Vite still only exposes VITE_* vars to the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  const GROQ_KEY = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY

  return {
    plugins: [react(), groqDevProxy(GROQ_KEY), sttDevProxy(GROQ_KEY)],
  }
})
