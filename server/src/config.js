import 'dotenv/config'

function required(name, fallback = undefined) {
  return process.env[name] ?? fallback
}

export const config = {
  port: Number(required('PORT', 5001)),
  clientUrl: required('CLIENT_URL', 'http://localhost:5173'),
  serverUrl: required('SERVER_URL', 'http://localhost:5001'),
  tokenEncryptionKey: required('TOKEN_ENCRYPTION_KEY', ''),
  google: {
    clientId: required('GOOGLE_CLIENT_ID', ''),
    clientSecret: required('GOOGLE_CLIENT_SECRET', ''),
    redirectUri: required('GOOGLE_REDIRECT_URI', 'http://localhost:5001/api/auth/google/callback'),
  },
  microsoft: {
    clientId: required('MICROSOFT_CLIENT_ID', ''),
    clientSecret: required('MICROSOFT_CLIENT_SECRET', ''),
    tenantId: required('MICROSOFT_TENANT_ID', 'common'),
    redirectUri: required('MICROSOFT_REDIRECT_URI', 'http://localhost:5001/api/auth/microsoft/callback'),
  },
  groq: {
    apiKey: required('GROQ_API_KEY', ''),
    model: required('GROQ_MODEL', 'llama-3.3-70b-versatile'),
  },
}

export const isGoogleConfigured = () => Boolean(config.google.clientId && config.google.clientSecret)
export const isMicrosoftConfigured = () => Boolean(config.microsoft.clientId && config.microsoft.clientSecret)
export const isAiConfigured = () => Boolean(config.groq.apiKey)
