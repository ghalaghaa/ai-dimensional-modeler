'use strict';

const { createApp } = require('../src/app');
const { clearRooms } = require('../src/rooms');
const { io: ioClient } = require('socket.io-client');

describe('Socket.IO real-time collaboration (genuine socket connections)', () => {
  let httpServer;
  let io;
  let baseUrl;
  const clientSockets = [];

  beforeAll((done) => {
    clearRooms();
    ({ httpServer, io } = createApp());
    // Bind to an ephemeral port (0) so tests never collide on a fixed port.
    httpServer.listen(0, () => {
      const { port } = httpServer.address();
      baseUrl = `http://localhost:${port}`;
      done();
    });
  });

  afterAll((done) => {
    clientSockets.forEach((s) => s.disconnect());
    io.close();
    httpServer.close(done);
  });

  afterEach(() => {
    // Disconnect any sockets created during a test so subsequent tests
    // start with a clean set of connections.
    while (clientSockets.length) {
      const s = clientSockets.pop();
      if (s.connected) s.disconnect();
    }
  });

  function connectClient({ autoConnect = true } = {}) {
    const socket = ioClient(baseUrl, {
      transports: ['websocket'],
      forceNew: true,
      autoConnect,
    });
    clientSockets.push(socket);
    return socket;
  }

  test('joining a room triggers a presence-update with the participant name', (done) => {
    const alice = connectClient();

    alice.on('connect', () => {
      alice.emit('join-room', { roomCode: 'PHYS101', displayName: 'Alice' });
    });

    alice.on('presence-update', ({ participants }) => {
      expect(participants).toContain('Alice');
      done();
    });
  });

  test('a second client sees presence grow to two participants', (done) => {
    const alice = connectClient();
    const bob = connectClient({ autoConnect: false });

    let aliceSawTwo = false;

    bob.on('connect', () => {
      bob.emit('join-room', { roomCode: 'CHEM220', displayName: 'Bob' });
    });

    alice.on('connect', () => {
      alice.emit('join-room', { roomCode: 'CHEM220', displayName: 'Alice' });
    });

    const guard = setTimeout(() => {
      if (!aliceSawTwo) {
        done(new Error('Never observed presence-update with 2 participants'));
      }
    }, 4000);

    alice.on('presence-update', ({ participants }) => {
      if (participants.length === 2) {
        aliceSawTwo = true;
        clearTimeout(guard);
        expect(participants.sort()).toEqual(['Alice', 'Bob']);
        done();
      } else {
        // First event: just Alice. Now bring Bob in.
        bob.connect();
      }
    });
  });

  test('note-update is broadcast to the other participant in the room (last-write-wins)', (done) => {
    const alice = connectClient();
    const bob = connectClient();

    alice.on('connect', () => {
      alice.emit('join-room', { roomCode: 'HIST301', displayName: 'Alice' });
    });

    bob.on('presence-update', ({ participants }) => {
      if (participants.length === 2) {
        // Both are in the room now; Alice edits the notes.
        alice.emit('note-update', { roomCode: 'HIST301', content: 'Chapter 5 summary' });
      }
    });

    bob.on('note-update', ({ content }) => {
      expect(content).toBe('Chapter 5 summary');
      done();
    });

    bob.on('connect', () => {
      bob.emit('join-room', { roomCode: 'HIST301', displayName: 'Bob' });
    });
  });

  test('chat-message emitted by one client is received by a second connected client', (done) => {
    const alice = connectClient();
    const bob = connectClient();

    alice.on('connect', () => {
      alice.emit('join-room', { roomCode: 'BIO101', displayName: 'Alice' });
    });

    bob.on('presence-update', ({ participants }) => {
      if (participants.length === 2) {
        alice.emit('chat-message', { roomCode: 'BIO101', text: 'Hey, ready to study?' });
      }
    });

    bob.on('chat-message', (message) => {
      expect(message.sender).toBe('Alice');
      expect(message.text).toBe('Hey, ready to study?');
      expect(typeof message.timestamp).toBe('number');
      done();
    });

    bob.on('connect', () => {
      bob.emit('join-room', { roomCode: 'BIO101', displayName: 'Bob' });
    });
  });

  test('leaving updates presence for remaining participants', (done) => {
    const alice = connectClient();
    const bob = connectClient();
    let bobJoined = false;

    alice.on('connect', () => {
      alice.emit('join-room', { roomCode: 'ENG150', displayName: 'Alice' });
    });

    alice.on('presence-update', ({ participants }) => {
      if (participants.length === 2 && !bobJoined) {
        bobJoined = true;
        // Now Bob disconnects; Alice should see presence shrink back to 1.
        bob.disconnect();
      } else if (participants.length === 1 && bobJoined) {
        expect(participants).toEqual(['Alice']);
        done();
      }
    });

    bob.on('connect', () => {
      bob.emit('join-room', { roomCode: 'ENG150', displayName: 'Bob' });
    });
  });
});
