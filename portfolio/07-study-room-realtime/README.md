# Study Room — Real-Time Collaboration

A tiny real-time collaborative study room: shared notes, live presence
("who's online"), and group chat, all synced instantly across everyone in
the same room. Built with Express and Socket.IO.

**Who it's for:** groups of students studying remotely together who want a
shared scratchpad and a lightweight way to see who's around and chat,
without spinning up a full video call or a heavyweight collaboration
platform. Open the same room code in a few browser tabs (or share it with
classmates) and you've got a shared study space.

## Tech stack

- **Node.js** + **Express** — HTTP server and REST endpoints
- **Socket.IO** — WebSocket transport for real-time notes/presence/chat
- **Vanilla JS + HTML/CSS** — zero-build static client (`public/index.html`)
- **Jest** + **Supertest** + **socket.io-client** — automated tests, including
  a genuine end-to-end Socket.IO integration test (real server, real
  WebSocket clients, no mocking)

No database — room state (notes + who's connected) lives in memory on the
server for the lifetime of the process. That's a deliberate simplicity
tradeoff for a demo/portfolio project; restarting the server resets all
rooms.

## How it works

- Clients connect over Socket.IO and send `join-room` with a `roomCode` and
  `displayName`. The server tracks room membership in memory and broadcasts
  a `presence-update` (full participant list) to everyone in that room.
- Shared notes are a single per-room text blob. Typing in the notes box
  emits `note-update` with the full current content; the server stores it
  and broadcasts it to every other participant (last-write-wins — good
  enough for a shared scratchpad, no operational transform / CRDT).
- Chat messages (`chat-message`) are broadcast to the whole room as
  `{ sender, text, timestamp }`.
- Disconnecting (closing the tab, losing the connection) automatically
  removes you from the room's participant list and re-broadcasts presence.
- A couple of plain REST endpoints exist alongside the sockets:
  - `GET /health` — basic liveness check
  - `GET /api/rooms/:code` — current note content + participant count/list
    for a room (404 if the room doesn't exist yet)

## Install

```bash
npm install
```

## Run

```bash
npm start
```

The server listens on `http://localhost:3000` by default (override with the
`PORT` environment variable).

## Try it live

1. Run `npm start`.
2. Open `http://localhost:3000` in two (or more) browser tabs/windows.
3. In each tab, enter a name and the **same room code** (e.g. `BIO101`),
   then click "Join room".
4. Type in the notes box in one tab — watch it appear in the other.
5. Send a chat message — it shows up in every joined tab instantly.
6. Close one of the tabs — the participant list updates live in the
   remaining tab(s).

You can also poke the REST API directly:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/rooms/BIO101
```

## Tests

```bash
npm test
```

This runs:

- **REST tests** (`test/rest.test.js`) via Supertest — health check, 404 for
  an unknown room, and correct note/participant state after a room has been
  populated.
- **Socket.IO integration tests** (`test/socket.test.js`) — these start the
  *actual* server on an ephemeral port and connect with real
  `socket.io-client` WebSocket clients (no mocking). They cover:
  - joining a room produces a `presence-update` with the right participant
  - a second client joining grows the presence list to two people
  - a `note-update` from one client is broadcast to the other
  - a `chat-message` from one client is received by a second connected
    client
  - disconnecting updates presence for the participants left behind

## Project structure

```
07-study-room-realtime/
├── package.json
├── jest.config.js
├── README.md
├── .gitignore
├── public/
│   └── index.html        # static client (vanilla JS + socket.io-client)
├── src/
│   ├── app.js             # Express app + Socket.IO wiring (factory, testable)
│   ├── server.js          # entry point: creates the app and listens
│   └── rooms.js            # in-memory room/presence store
└── test/
    ├── rest.test.js       # Supertest REST endpoint tests
    └── socket.test.js     # real Socket.IO client/server integration tests
```
