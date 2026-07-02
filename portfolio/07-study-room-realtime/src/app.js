'use strict';

const path = require('node:path');
const http = require('node:http');
const express = require('express');
const { Server } = require('socket.io');

const { getOrCreateRoom, getRoom, getParticipantList } = require('./rooms');

/**
 * Builds the Express app + HTTP server + Socket.IO server, and wires up
 * all REST routes and socket event handlers.
 *
 * Kept as a factory function (rather than listening immediately) so that
 * tests can create an isolated instance bound to an ephemeral port.
 */
function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  // ---------------------------------------------------------------------
  // REST endpoints
  // ---------------------------------------------------------------------

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/api/rooms/:code', (req, res) => {
    const room = getRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    return res.json({
      code: room.code,
      noteContent: room.noteContent,
      participantCount: room.participants.size,
      participants: getParticipantList(room),
    });
  });

  // ---------------------------------------------------------------------
  // Socket.IO event handlers
  // ---------------------------------------------------------------------

  io.on('connection', (socket) => {
    // Track which room this socket is currently in so we can clean up on
    // disconnect without the client having to tell us again.
    socket.data.roomCode = null;
    socket.data.displayName = null;

    socket.on('join-room', ({ roomCode, displayName }) => {
      if (!roomCode || typeof roomCode !== 'string') return;
      const name = (displayName && String(displayName).trim()) || 'Anonymous';

      const room = getOrCreateRoom(roomCode);

      socket.join(roomCode);
      room.participants.set(socket.id, name);
      socket.data.roomCode = roomCode;
      socket.data.displayName = name;

      // Send the newly-joined client the current note content so it can
      // hydrate its editor immediately.
      socket.emit('note-sync', { content: room.noteContent });

      io.to(roomCode).emit('presence-update', {
        participants: getParticipantList(room),
      });
    });

    socket.on('note-update', ({ roomCode, content }) => {
      if (!roomCode) return;
      const room = getRoom(roomCode);
      if (!room) return;
      room.noteContent = content ?? '';
      // Broadcast to everyone else in the room (sender already has it).
      socket.to(roomCode).emit('note-update', { content: room.noteContent });
    });

    socket.on('chat-message', ({ roomCode, text }) => {
      if (!roomCode || !text) return;
      const room = getRoom(roomCode);
      if (!room) return;
      const message = {
        sender: socket.data.displayName || 'Anonymous',
        text: String(text),
        timestamp: Date.now(),
      };
      io.to(roomCode).emit('chat-message', message);
    });

    socket.on('leave-room', () => {
      leaveCurrentRoom(socket, io);
    });

    socket.on('disconnect', () => {
      leaveCurrentRoom(socket, io);
    });
  });

  return { app, httpServer, io };
}

function leaveCurrentRoom(socket, io) {
  const roomCode = socket.data.roomCode;
  if (!roomCode) return;

  const room = getRoom(roomCode);
  socket.data.roomCode = null;

  if (!room) return;

  room.participants.delete(socket.id);
  socket.leave(roomCode);

  io.to(roomCode).emit('presence-update', {
    participants: getParticipantList(room),
  });
}

module.exports = { createApp };
