'use strict';

/**
 * In-memory room store.
 *
 * A room is created lazily the first time it's referenced (either via a
 * REST lookup or a socket join). Each room tracks:
 *  - noteContent: the current shared notes document (last-write-wins)
 *  - participants: Map<socketId, displayName> of who is currently connected
 *
 * This is intentionally a simple in-memory Map. Restarting the server
 * clears all rooms. That's fine for a demo/portfolio project.
 */

const rooms = new Map();

function getOrCreateRoom(roomCode) {
  let room = rooms.get(roomCode);
  if (!room) {
    room = {
      code: roomCode,
      noteContent: '',
      participants: new Map(), // socketId -> displayName
    };
    rooms.set(roomCode, room);
  }
  return room;
}

function getRoom(roomCode) {
  return rooms.get(roomCode);
}

function getParticipantList(room) {
  return Array.from(room.participants.values());
}

function clearRooms() {
  rooms.clear();
}

module.exports = {
  rooms,
  getOrCreateRoom,
  getRoom,
  getParticipantList,
  clearRooms,
};
