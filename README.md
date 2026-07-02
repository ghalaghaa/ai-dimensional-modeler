# ApplyFlow — Job Application Emailer

Send personalized job application emails to hundreds of companies, one individual email per
recipient (never CC/BCC), with live sending progress, pause/resume/cancel/retry, and OAuth-based
Gmail / Outlook sending.

## Stack

- **Frontend**: React 19 + Vite, Tailwind CSS, TipTap (rich text), Framer Motion, Socket.IO client
- **Backend**: Node.js + Express, SQLite (better-sqlite3), Socket.IO, Gmail API (`googleapis`),
  Microsoft Graph (raw OAuth2 + `fetch`)
- No passwords are ever requested or stored — sending is authorized purely via OAuth 2.0, and
  access/refresh tokens are encrypted at rest (AES-256-GCM).

## Project layout

```
src/            React frontend (Vite)
server/         Express API + SQLite + the campaign sending engine
server/uploads/ Uploaded attachments (gitignored, created at runtime)
server/data/    SQLite database file (gitignored, created at runtime)
```

## 1. Install

```bash
npm run install:all   # installs both the frontend and server/ dependencies
```

## 2. Configure the backend

```bash
cp server/.env.example server/.env
```

Generate an encryption key for OAuth tokens and put it in `server/.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gmail (Google OAuth)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Enable the **Gmail API** for your project.
3. Create an **OAuth 2.0 Client ID** (Web application).
4. Add `http://localhost:5001/api/auth/google/callback` as an authorized redirect URI.
5. Put the client ID/secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `server/.env`.
6. While your OAuth consent screen is in "Testing" mode, add your own Google account as a test user.

### Outlook (Microsoft Graph)

1. Go to [Azure AD App registrations](https://portal.azure.com) and create a new registration.
2. Add `http://localhost:5001/api/auth/microsoft/callback` as a Web redirect URI.
3. Under API permissions, add delegated Microsoft Graph permissions `Mail.Send`, `User.Read`,
   `offline_access`, and grant admin consent if required by your tenant.
4. Create a client secret and put the app (client) ID/secret into `MICROSOFT_CLIENT_ID` /
   `MICROSOFT_CLIENT_SECRET` in `server/.env`.

### AI personalization (optional, bonus feature)

Set `GROQ_API_KEY` in `server/.env` to enable AI-generated, per-recipient opening lines (uses
Groq's OpenAI-compatible chat completions API). Without it, everything else works normally — the
AI toggle in Compose will just tell you it isn't configured.

## 3. Run

```bash
npm run dev   # starts the Vite dev server (5173) and the API server (5001) together
```

Open http://localhost:5173.

## How sending works

1. Add recipients (manual entry, paste, or CSV/Excel import) on **Recipients**, select who to
   include.
2. Write the email once on **Compose**, using `{{company_name}}`, `{{recruiter_name}}`,
   `{{job_title}}`, `{{my_name}}` placeholders (and optionally `{{ai_personalization}}`), attach
   your CV/cover letter/portfolio, and preview exactly what each recipient will receive.
3. On **Send**, pick which connected account to send from, set a random delay range (default
   20–60s) between sends, and start (or schedule) the campaign.
4. The backend processes recipients one at a time — each gets its own individually addressed
   email via the Gmail API or Microsoft Graph `sendMail` (`to` only, never CC/BCC) — waiting a
   random delay in your configured range between sends. Progress, per-recipient status, and error
   logs stream to the browser in real time over Socket.IO. You can pause, resume, cancel, or
   retry just the failed recipients at any point.
5. **History** lists every campaign with its stats and a CSV export of per-recipient outcomes.

## Deploying to a public URL (Render)

In production, the Express server also serves the built frontend, so the whole app lives behind
a single URL — no separate static host or CORS setup needed.

1. Push this repo to your own GitHub account (or use this one) and connect it in the
   [Render dashboard](https://dashboard.render.com/) — it will detect `render.yaml` and provision
   one Web Service.
2. Before the first deploy finishes, note the public URL Render assigns
   (e.g. `https://applyflow.onrender.com`).
3. In Render's environment variables for the service, set:
   - `CLIENT_URL` and `SERVER_URL` → your Render URL
   - `TOKEN_ENCRYPTION_KEY` → output of
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` (see the Gmail OAuth
     steps above, but use `https://<your-render-url>/api/auth/google/callback` as the redirect
     URI, both in Google Cloud Console and here)
   - the equivalent `MICROSOFT_*` variables if you also want Outlook
   - `GROQ_API_KEY` if you want AI personalization
4. Trigger a deploy (or redeploy after adding the env vars). Once it's live, open the URL, go to
   **Settings**, and connect your Gmail/Outlook account for real.

**Caveat:** Render's free plan does not include a persistent disk, so the SQLite database (and
uploaded attachments) reset whenever the service restarts or redeploys — fine for testing, but for
durable production use, add a paid persistent disk mounted at `server/data` and `server/uploads`,
or swap SQLite for a managed database.

## Duplicate-sending safeguards

- Recipient emails are deduplicated within your working list (manual add, paste, and import all
  reject/skip emails already present).
- Each campaign snapshot enforces a unique `(campaign, email)` pair, so a recipient can never
  receive two emails from the same campaign, even across pause/resume/retry.
- When you launch a new campaign, you're warned (non-blocking) if any selected recipients already
  received a **successfully sent** email in a previous campaign.

## Known limitations / accepted risks

- `xlsx` (SheetJS) has known ReDoS/prototype-pollution advisories with no patched release on npm;
  it's only used server-side to parse spreadsheet files you import yourself. Acceptable for a
  self-service tool, but avoid importing spreadsheets from untrusted third parties.
- The sending engine runs as an in-process loop per campaign (timers held in memory). It's
  appropriate for a single-instance deployment; horizontally scaling to multiple server instances
  would need a shared job queue instead.
- OAuth apps in Google/Microsoft "testing" mode are limited to a handful of test users — publish
  your app (or use a work/school tenant) before relying on this for real, ongoing use beyond your
  own accounts.
