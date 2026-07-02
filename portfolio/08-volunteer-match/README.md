# Volunteer Match

A small full-stack app that connects volunteers with volunteer opportunities.

- **Volunteers** can browse opportunities, filter them by category, and apply
  with a single click.
- **Nonprofits / organizations** can post new opportunities through a simple
  form, which immediately appear in the shared list.

This is one of a set of portfolio projects; it intentionally keeps the stack
small and readable rather than reaching for a framework-heavy solution.

## Tech stack

- **Frontend**: React 19 (functional components + hooks) scaffolded with
  Vite, plain CSS (no UI framework).
- **Backend**: Express (Node.js, ESM), in-memory data store (no database —
  data resets whenever the server restarts).
- **Testing**:
  - Frontend — Vitest + React Testing Library, with `fetch` mocked so
    component tests run without the real backend.
  - Backend — Node's built-in test runner (`node --test`) + Supertest,
    exercising the Express app directly (no network sockets needed).

## Project layout

```
08-volunteer-match/
├── server/                 # Express API (own package.json)
│   ├── app.js               # createApp() factory - builds an Express app
│   ├── data.js               # seed data for the in-memory opportunity list
│   ├── index.js               # starts the HTTP server (uses createApp())
│   └── test/
│       └── opportunities.test.js
├── src/                    # React frontend
│   ├── api.js                # fetch wrapper for the /api/* endpoints
│   ├── App.jsx                # top-level component / state management
│   ├── App.test.jsx            # frontend integration tests (fetch mocked)
│   └── components/
│       ├── CategoryFilter.jsx
│       ├── NewOpportunityForm.jsx
│       ├── OpportunityCard.jsx
│       └── OpportunityList.jsx
├── vite.config.js           # dev server + /api proxy + Vitest config
└── package.json              # frontend scripts (also proxies to server/ scripts)
```

## API

All endpoints are served by the Express app under `/api`:

| Method | Path                             | Description                                                   |
| ------ | --------------------------------- | --------------------------------------------------------------- |
| GET    | `/api/opportunities`              | List all opportunities. Supports `?category=Education` etc.    |
| GET    | `/api/opportunities/:id`          | Fetch a single opportunity.                                     |
| POST   | `/api/opportunities`              | Create a new opportunity (organizations post here).             |
| POST   | `/api/opportunities/:id/apply`    | Apply — decrements `spotsAvailable`; `400` if none are left.    |

Opportunity fields: `id`, `title`, `organization`, `category`
(`Education` / `Environment` / `Health` / `Animals`), `location`, `date`,
`spotsAvailable`, `description`.

## Install and run

The frontend and backend have separate `package.json` files, so install both.

```bash
# from 08-volunteer-match/
npm install

# from 08-volunteer-match/server/
cd server && npm install && cd ..
```

Run the backend API (defaults to `http://localhost:4000`):

```bash
npm run server        # node server/index.js
# or, with auto-restart on change:
npm run server:dev
```

In a second terminal, run the frontend dev server (defaults to
`http://localhost:5173`):

```bash
npm run dev
```

The Vite dev server proxies any request to `/api/*` through to
`http://localhost:4000` (see the `server.proxy` block in `vite.config.js`),
so the React app can simply call `fetch('/api/opportunities')` with no CORS
configuration needed — as long as the backend is running.

Build the frontend for production:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Tests

Frontend tests (Vitest + React Testing Library, `fetch` is mocked so no
backend needs to be running):

```bash
npm test
```

Backend tests (Node's built-in test runner + Supertest, exercises the
Express app directly, no server process needs to be running):

```bash
cd server && npm test
```

## Notes

- Data is stored in memory only — restarting the backend resets it back to
  the seeded sample opportunities.
- The seed data includes 10 opportunities across all four categories, plus
  one (`Beach & Coastline Cleanup`) that starts with zero spots so the "Full"
  state is visible right away.
