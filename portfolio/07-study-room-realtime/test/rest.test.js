'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { clearRooms, getOrCreateRoom } = require('../src/rooms');

describe('REST endpoints', () => {
  let app;
  let httpServer;
  let io;

  beforeEach(() => {
    clearRooms();
    ({ app, httpServer, io } = createApp());
  });

  afterEach(async () => {
    io.close();
    await new Promise((resolve) => httpServer.close(resolve));
  });

  test('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  test('GET /api/rooms/:code returns 404 for unknown room', async () => {
    const res = await request(app).get('/api/rooms/DOES-NOT-EXIST');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Room not found');
  });

  test('GET /api/rooms/:code returns note content and participant count after a join', async () => {
    const room = getOrCreateRoom('MATH200');
    room.noteContent = 'Derivatives review';
    room.participants.set('fake-socket-1', 'Alice');
    room.participants.set('fake-socket-2', 'Bob');

    const res = await request(app).get('/api/rooms/MATH200');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      code: 'MATH200',
      noteContent: 'Derivatives review',
      participantCount: 2,
    });
    expect(res.body.participants.sort()).toEqual(['Alice', 'Bob']);
  });
});
