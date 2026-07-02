// Small fetch wrapper for talking to the Express backend.
// In dev, Vite proxies /api/* to http://localhost:4000 (see vite.config.js),
// so these calls work with no CORS configuration needed on the client side.

const BASE_URL = '/api/opportunities'

async function handleResponse(res) {
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`
    throw new Error(message)
  }
  return data
}

export async function fetchOpportunities(category) {
  const url = category && category !== 'All'
    ? `${BASE_URL}?category=${encodeURIComponent(category)}`
    : BASE_URL
  const res = await fetch(url)
  return handleResponse(res)
}

export async function createOpportunity(opportunity) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opportunity),
  })
  return handleResponse(res)
}

export async function applyToOpportunity(id) {
  const res = await fetch(`${BASE_URL}/${id}/apply`, { method: 'POST' })
  return handleResponse(res)
}
