const FALLBACKS = {
  company_name: 'your company',
  recruiter_name: 'Hiring Manager',
  job_title: 'the open position',
  my_name: '',
}

export const PLACEHOLDER_KEYS = ['company_name', 'recruiter_name', 'job_title', 'my_name']

export function renderTemplate(text, data = {}) {
  if (!text) return ''
  return text.replace(/{{\s*(company_name|recruiter_name|job_title|my_name|ai_personalization)\s*}}/g, (_, key) => {
    const value = data[key]
    if (value != null && String(value).trim() !== '') return String(value)
    return FALLBACKS[key] ?? ''
  })
}
