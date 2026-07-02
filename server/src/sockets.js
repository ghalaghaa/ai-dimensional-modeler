let ioInstance = null

export function setIo(io) {
  ioInstance = io
}

export function emitToCampaign(campaignId, event, payload) {
  ioInstance?.to(`campaign:${campaignId}`).emit(event, payload)
}
