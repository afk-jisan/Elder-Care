import { isLiveVideoRoom, videoRoomLabel } from './videoSession';

export function VideoBadge({ roomId }) {
  const live = isLiveVideoRoom(roomId);
  return (
    <span className={`video-badge ${live ? 'live' : 'unavailable'}`}>
      {videoRoomLabel(roomId)}
    </span>
  );
}

export const emptyNotes = {
  notes: '',
  diagnosis: '',
  followUp: '',
  medicineName: '',
  dosage: '',
  frequency: '',
  duration: '',
};
