import { Router } from 'express'
import { config, isAiConfigured } from '../config.js'

const router = Router()

export async function generatePersonalization({ company_name, job_title, recruiter_name }) {
  const prompt = `Write ONE short, warm, professional sentence (max 30 words) to open a job application email, referencing the company and/or role naturally. No greeting, no "Dear", no signature - just the sentence itself, plain text.
Company: ${company_name || 'the company'}
Role: ${job_title || 'the open role'}
Recruiter: ${recruiter_name || 'the hiring team'}`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.groq.apiKey}` },
    body: JSON.stringify({
      model: config.groq.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 100,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Groq API error (${response.status}): ${text}`)
  }
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

router.post('/personalize', async (req, res) => {
  if (!isAiConfigured()) {
    return res.status(501).json({ error: 'AI personalization is not configured. Set GROQ_API_KEY in server/.env.' })
  }
  try {
    const text = await generatePersonalization(req.body || {})
    res.json({ text })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

export default router
