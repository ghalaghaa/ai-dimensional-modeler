import * as XLSX from 'xlsx'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

// Parses free-form pasted text: one email per line, or comma/space separated.
export function parsePastedEmails(text) {
  const matches = String(text || '').match(EMAIL_RE) || []
  return [...new Set(matches.map((e) => e.trim().toLowerCase()))]
}

const HEADER_ALIASES = {
  email: 'email',
  'e-mail': 'email',
  'email address': 'email',
  emailaddress: 'email',
  company: 'company_name',
  company_name: 'company_name',
  companyname: 'company_name',
  organization: 'company_name',
  employer: 'company_name',
  recruiter: 'recruiter_name',
  recruiter_name: 'recruiter_name',
  recruitername: 'recruiter_name',
  contact: 'recruiter_name',
  'contact name': 'recruiter_name',
  'hiring manager': 'recruiter_name',
  name: 'recruiter_name',
  job_title: 'job_title',
  jobtitle: 'job_title',
  title: 'job_title',
  role: 'job_title',
  position: 'job_title',
}

function normalizeHeader(header) {
  const key = String(header || '').trim().toLowerCase()
  return HEADER_ALIASES[key] || null
}

// Parses a CSV/XLSX file buffer into { company_name, recruiter_name, job_title, email } rows.
export function parseSpreadsheet(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  const results = []
  for (const row of rows) {
    const mapped = { company_name: '', recruiter_name: '', job_title: '', email: '' }
    for (const [rawHeader, value] of Object.entries(row)) {
      const field = normalizeHeader(rawHeader)
      if (field && String(value).trim()) mapped[field] = String(value).trim()
    }
    if (!mapped.email) {
      // Fall back to scanning the row's raw values for anything email-shaped.
      const found = Object.values(row).map(String).find((v) => EMAIL_RE.test(v))
      EMAIL_RE.lastIndex = 0
      if (found) mapped.email = found.match(EMAIL_RE)?.[0] || ''
      EMAIL_RE.lastIndex = 0
    }
    if (mapped.email) results.push({ ...mapped, email: mapped.email.toLowerCase() })
  }
  return results
}
