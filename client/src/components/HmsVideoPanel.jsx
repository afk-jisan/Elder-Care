import { useEffect, useRef, useState } from 'react';
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  useHMSNotifications,
  useVideo,
  useAVToggle,
  selectPeers,
  selectIsConnectedToRoom,
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled,
  HMSNotificationTypes,
} from '@100mslive/react-sdk';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { isLiveVideoRoom } from '../lib/videoSession';

function MicIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function MicOffIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function VideoIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );
}

function VideoOffIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M21 16V7a2 2 0 0 0-2-2H8"/>
      <path d="M3 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h13"/>
      <polygon points="23 7 16 12 23 17 23 7"/>
    </svg>
  );
}

function PhoneOffIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.33a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PeerTile({ peer }) {
  const { videoRef } = useVideo({ trackId: peer.videoTrack });
  const isAudioEnabled = useHMSStore(selectIsPeerAudioEnabled(peer.id));
  const isVideoEnabled = useHMSStore(selectIsPeerVideoEnabled(peer.id));

  return (
    <div className={`hms-peer${peer.isLocal ? ' is-local' : ''}`}>
      <div className="hms-peer-frame">
        <video
          ref={videoRef}
          autoPlay
          muted={peer.isLocal}
          playsInline
          className="hms-peer-video"
        />
        {!peer.videoTrack && (
          <div className="hms-peer-placeholder">
            <div className="hms-peer-avatar">
              {peer.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        )}
        <div className="hms-peer-status-indicators">
          <span
            className={`hms-status-icon-badge ${isAudioEnabled ? 'on' : 'off'}`}
            title={isAudioEnabled ? 'Microphone unmuted' : 'Microphone muted'}
          >
            {isAudioEnabled ? <MicIcon size={12} /> : <MicOffIcon size={12} />}
          </span>
          <span
            className={`hms-status-icon-badge ${isVideoEnabled ? 'on' : 'off'}`}
            title={isVideoEnabled ? 'Camera on' : 'Camera off'}
          >
            {isVideoEnabled ? <VideoIcon size={12} /> : <VideoOffIcon size={12} />}
          </span>
        </div>
      </div>
      <span className="hms-peer-name">
        {peer.name}
        {peer.isLocal ? ' (You)' : ''}
      </span>
    </div>
  );
}

function formatHmsError(data) {
  if (!data) return 'Video connection failed';
  const message = data.message || data.description || data.name;
  if (message === 'invalid role') {
    return 'Video role configuration error. Restart the API server and start a new session.';
  }
  return String(message);
}

function HmsVideoCall({ sessionId, rolePath, roomId, elderName, caregiverName, doctorName, onClose }) {
  const { user } = useAuth();
  const hmsActions = useHMSActions();
  const actionsRef = useRef(hmsActions);
  actionsRef.current = hmsActions;
  const joinedRef = useRef(false);

  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const hmsError = useHMSNotifications(HMSNotificationTypes.ERROR);
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('preparing');

  useEffect(() => {
    if (!hmsError?.data) return;
    setError(formatHmsError(hmsError.data));
    setStatus('error');
  }, [hmsError]);

  useEffect(() => {
    let cancelled = false;

    async function joinRoom() {
      if (!isLiveVideoRoom(roomId)) {
        setError(
          'This session cannot join live video. End it and request a new consult.'
        );
        setStatus('error');
        return;
      }

      setStatus('token');
      setError('');
      try {
        const data = await apiRequest(`/${rolePath}/sessions/${sessionId}/token`);
        if (cancelled) return;

        setStatus('joining');
        await actionsRef.current.join({
          userName: user?.name || 'Participant',
          authToken: data.authToken,
          settings: {
            isAudioMuted: false,
            isVideoMuted: false,
          },
        });
        if (cancelled) return;
        joinedRef.current = true;
        setStatus('connected');
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus('error');
        }
      }
    }

    joinRoom();

    return () => {
      cancelled = true;
      if (joinedRef.current) {
        joinedRef.current = false;
        actionsRef.current.leave().catch(() => {});
      }
    };
  }, [sessionId, rolePath, roomId, user?.name]);

  async function handleClose() {
    if (joinedRef.current) {
      joinedRef.current = false;
      await actionsRef.current.leave().catch(() => {});
    }
    onClose?.();
  }

  const waitingToConnect =
    !error && (status === 'preparing' || status === 'token' || status === 'joining');
  const showStage = (isConnected || status === 'connected') && !error;

  return (
    <div className="hms-call">
      {(elderName || caregiverName || doctorName) && (
        <div className="hms-call-header">
          {elderName && (
            <div className="hms-call-header-elder">
              Patient / Elder: <strong>{elderName}</strong>
            </div>
          )}
          {caregiverName && rolePath === 'doctor' && (
            <div className="hms-call-header-sub">
              Caregiver: <span>{caregiverName}</span>
            </div>
          )}
          {doctorName && rolePath === 'caregiver' && (
            <div className="hms-call-header-sub">
              Doctor: <span>{doctorName}</span>
            </div>
          )}
        </div>
      )}

      <div className="hms-stage">
        {waitingToConnect && (
          <div className="hms-stage-overlay">
            <div className="hms-spinner" aria-hidden="true" />
            <p>
              {status === 'token'
                ? 'Connecting to the consultation room...'
                : 'Joining the call. Allow camera and microphone when prompted.'}
            </p>
          </div>
        )}

        {error && (
          <div className="hms-stage-overlay hms-stage-overlay-error">
            <p className="error">{error}</p>
          </div>
        )}

        {showStage && peers.length === 0 && (
          <div className="hms-stage-overlay">
            <p>Connected. Waiting for the other participant to join...</p>
          </div>
        )}

        {showStage && peers.length > 0 && (
          <div className={`hms-peer-grid${peers.length === 1 ? ' single' : ''}`}>
            {peers.map((peer) => (
              <PeerTile key={peer.id} peer={peer} />
            ))}
          </div>
        )}
      </div>

      {showStage && (
        <div className="hms-control-bar">
          <button
            type="button"
            className={`hms-control-btn${isLocalAudioEnabled ? '' : ' off'}`}
            onClick={toggleAudio}
            title={isLocalAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isLocalAudioEnabled ? <MicIcon /> : <MicOffIcon />}
            <span>{isLocalAudioEnabled ? 'Mute' : 'Unmute'}</span>
          </button>
          <button
            type="button"
            className={`hms-control-btn${isLocalVideoEnabled ? '' : ' off'}`}
            onClick={toggleVideo}
            title={isLocalVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
          >
            {isLocalVideoEnabled ? <VideoIcon /> : <VideoOffIcon />}
            <span>{isLocalVideoEnabled ? 'Camera off' : 'Camera on'}</span>
          </button>
          {onClose && (
            <button
              type="button"
              className="hms-control-btn danger"
              onClick={handleClose}
              title="Leave video consultation"
            >
              <PhoneOffIcon />
              <span>Leave</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HmsVideoPanel({ sessionId, rolePath, roomId, elderName, caregiverName, doctorName, onClose }) {
  return (
    <HMSRoomProvider>
      <HmsVideoCall
        sessionId={sessionId}
        rolePath={rolePath}
        roomId={roomId}
        elderName={elderName}
        caregiverName={caregiverName}
        doctorName={doctorName}
        onClose={onClose}
      />
    </HMSRoomProvider>
  );
}
