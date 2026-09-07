export function isLiveVideoRoom(roomId) {
  return Boolean(roomId) && !String(roomId).startsWith('mock-100ms-');
}

export function videoRoomLabel(roomId) {
  if (!roomId) return '—';
  return isLiveVideoRoom(roomId) ? 'Live' : 'Unavailable';
}
