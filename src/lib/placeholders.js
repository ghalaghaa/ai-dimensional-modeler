export const PLACEHOLDERS = [
  { key: 'company_name', label: 'Company Name' },
  { key: 'recruiter_name', label: 'Recruiter Name' },
  { key: 'job_title', label: 'Job Title' },
  { key: 'my_name', label: 'My Name' },
]

const FALLBACKS = {
  company_name: 'your company',
  recruiter_name: 'Hiring Manager',
  job_title: 'the open position',
  my_name: 'Your Name',
  ai_personalization: '[AI-personalized opening line will appear here]',
}

export function renderTemplate(text, data = {}) {
  if (!text) return ''
  return text.replace(/{{\s*(company_name|recruiter_name|job_title|my_name|ai_personalization)\s*}}/g, (_, key) => {
    const value = data[key]
    if (value != null && String(value).trim() !== '') return String(value)
    return FALLBACKS[key] ?? ''
  })
}
