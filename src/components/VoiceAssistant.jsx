import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, X, Loader2, Radio, Volume2 } from 'lucide-react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { supabase } from '../lib/supabase';

function attachAudioTrack(track, audioElements, onBlocked) {
  if (!track || track.kind !== Track.Kind.Audio) return;
  const elements = track.attach();
  elements.forEach((element) => {
    element.autoplay = true;
    element.playsInline = true;
    element.setAttribute('aria-hidden', 'true');
    element.style.position = 'fixed';
    element.style.width = '1px';
    element.style.height = '1px';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    document.body.appendChild(element);
    audioElements.push(element);

    // Chrome/Edge may block autoplay for remote audio. Try immediately,
    // then surface an explicit speaker-unlock action when required.
    element.play?.().catch(() => onBlocked?.());
  });
}

function voiceErrorMessage(error) {
  const name = error?.name || '';
  const message = String(error?.message || '');

  if (name === 'NotAllowedError') {
    return 'Microphone permission was denied. Allow microphone access for AjayBot in your browser settings and try again.';
  }
  if (name === 'NotFoundError') {
    return 'No microphone was found. Connect a microphone and try again.';
  }
  if (name === 'NotReadableError') {
    return 'The microphone is already being used by another application. Close the other app and try again.';
  }
  if (name === 'SecurityError') {
    return 'Microphone access requires a secure HTTPS page.';
  }
  return message || 'Unable to start voice mode.';
}

function detachAudioTrack(track, audioElements) {
  if (!track) return;
  try {
    const elements = track.detach();
    elements.forEach((element) => {
      const index = audioElements.indexOf(element);
      if (index !== -1) audioElements.splice(index, 1);
      try {
        element.pause();
        element.remove();
      } catch {}
    });
  } catch {}
}

export default function VoiceAssistant({ open, onClose, userName = 'Ajay' }) {
  const roomRef = useRef(null);
  const audioElementsRef = useRef([]);
  const agentWaitTimerRef = useRef(null);
  const agentConnectedRef = useRef(false);
  const sessionIdRef = useRef(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [micEnabled, setMicEnabled] = useState(false);
  const [speakerBlocked, setSpeakerBlocked] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);

  const clearAgentWaitTimer = () => {
    if (agentWaitTimerRef.current) {
      clearTimeout(agentWaitTimerRef.current);
      agentWaitTimerRef.current = null;
    }
  };

  const cleanupRoom = async () => {
    clearAgentWaitTimer();

    const room = roomRef.current;
    roomRef.current = null;

    if (room) {
      try {
        room.removeAllListeners();
        await room.disconnect();
      } catch {}
    }

    for (const element of audioElementsRef.current) {
      try {
        element.pause();
        element.remove();
      } catch {}
    }

    audioElementsRef.current = [];
    agentConnectedRef.current = false;
    setMicEnabled(false);
    setAgentConnected(false);
    setUserSpeaking(false);
  };

  useEffect(() => {
    if (open) {
      sessionIdRef.current += 1;
      setStatus('idle');
      setError('');
      setMicEnabled(false);
      setSpeakerBlocked(false);
      setAgentConnected(false);
      setUserSpeaking(false);
    }

    return () => {
      sessionIdRef.current += 1;
      void cleanupRoom();
    };
  }, [open]);

  const startVoice = async () => {
    if (status === 'connecting' || status === 'connected') return;

    const sessionId = sessionIdRef.current + 1;
    sessionIdRef.current = sessionId;

    setStatus('connecting');
    setError('');
    setMicEnabled(false);
    setAgentConnected(false);
    setUserSpeaking(false);

    if (!window.isSecureContext) {
      setError('Voice mode requires a secure HTTPS connection.');
      setStatus('error');
      return;
    }

    if (!supabase) {
      setError('Supabase authentication is not configured on this deployment.');
      setStatus('error');
      return;
    }

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    roomRef.current = room;

    try {
      // This must be called from the Start Voice click/tap handler because
      // browsers restrict autoplay from asynchronous code.
      try {
        await room.startAudio();
        setSpeakerBlocked(false);
      } catch {
        setSpeakerBlocked(true);
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const session = sessionData?.session;
      if (!session?.access_token) {
        throw new Error('Your AjayBot login session is missing. Please sign in again.');
      }

      const tokenResponse = await fetch('/api/voice-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({}),
      });

      if (!tokenResponse.ok) {
        let message = 'Could not create a LiveKit voice session.';
        try {
          const data = await tokenResponse.json();
          message = data.error || message;
        } catch {}
        throw new Error(message);
      }

      const connection = await tokenResponse.json();
      if (!connection.serverUrl || !connection.participantToken) {
        throw new Error('The voice server returned incomplete connection details.');
      }

      const handleTrackSubscribed = (track, _publication, participant) => {
        if (sessionIdRef.current !== sessionId) return;
        if (participant) {
          agentConnectedRef.current = true;
          setAgentConnected(true);
          clearAgentWaitTimer();
        }
        attachAudioTrack(
          track,
          audioElementsRef.current,
          () => setSpeakerBlocked(true),
        );
      };

      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        detachAudioTrack(track, audioElementsRef.current);
      });

      room.on(RoomEvent.ParticipantConnected, () => {
        if (sessionIdRef.current !== sessionId) return;
        agentConnectedRef.current = true;
        setAgentConnected(true);
        setError('');
        clearAgentWaitTimer();
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        if (sessionIdRef.current !== sessionId) return;
        const connected = room.remoteParticipants.size > 0;
        agentConnectedRef.current = connected;
        setAgentConnected(connected);

        if (!connected && status === 'connected') {
          setError('The AjayBot voice agent disconnected. End the call and start voice again.');
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        if (sessionIdRef.current !== sessionId) return;
        setUserSpeaking(
          speakers.some((speaker) => speaker.sid === room.localParticipant.sid),
        );
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        if (sessionIdRef.current !== sessionId) return;
        setSpeakerBlocked(!room.canPlaybackAudio);
      });

      room.on(RoomEvent.MediaDevicesError, (deviceError) => {
        if (sessionIdRef.current !== sessionId) return;
        setError(voiceErrorMessage(deviceError));
      });

      room.on(RoomEvent.TrackSubscriptionFailed, (_sid, _participant, reason) => {
        if (sessionIdRef.current !== sessionId) return;
        setError('Audio subscription failed' + (reason ? ': ' + reason : '.'));
      });

      room.on(RoomEvent.Disconnected, () => {
        if (sessionIdRef.current !== sessionId) return;
        clearAgentWaitTimer();
        agentConnectedRef.current = false;
        setMicEnabled(false);
        setAgentConnected(false);
        setUserSpeaking(false);
        setStatus('idle');
      });

      await room.prepareConnection(connection.serverUrl, connection.participantToken);
      await room.connect(connection.serverUrl, connection.participantToken);

      if (sessionIdRef.current !== sessionId) {
        await room.disconnect();
        return;
      }

      for (const participant of room.remoteParticipants.values()) {
        agentConnectedRef.current = true;
        setAgentConnected(true);
        clearAgentWaitTimer();

        for (const publication of participant.trackPublications.values()) {
          if (publication.track) {
            attachAudioTrack(
              publication.track,
              audioElementsRef.current,
              () => setSpeakerBlocked(true),
            );
          }
        }
      }

      try {
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (microphoneError) {
        throw microphoneError;
      }

      setMicEnabled(true);
      setSpeakerBlocked(!room.canPlaybackAudio);
      setStatus('connected');

      agentWaitTimerRef.current = setTimeout(() => {
        if (sessionIdRef.current !== sessionId || agentConnectedRef.current) return;
        setError(
          'The room is connected, but the AjayBot voice agent has not joined. ' +
          'Deploy and start the ajaybot-voice production agent in LiveKit Cloud.',
        );
      }, 30000);
    } catch (err) {
      if (sessionIdRef.current !== sessionId) return;
      console.error('LiveKit voice connection error:', err);
      await cleanupRoom();
      setError(voiceErrorMessage(err));
      setStatus('error');
    }
  };

  const enableSpeaker = async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.startAudio();
      for (const element of audioElementsRef.current) {
        try { await element.play(); } catch {}
      }
      setSpeakerBlocked(!room.canPlaybackAudio);
      if (room.canPlaybackAudio) setError('');
    } catch (err) {
      setError(voiceErrorMessage(err));
    }
  };

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room || status !== 'connected') return;

    try {
      const nextEnabled = !micEnabled;
      await room.localParticipant.setMicrophoneEnabled(nextEnabled);
      setMicEnabled(nextEnabled);
      setError('');
    } catch (err) {
      setError(voiceErrorMessage(err));
    }
  };

  const endVoice = async () => {
    sessionIdRef.current += 1;
    await cleanupRoom();
    setStatus('idle');
    onClose?.();
  };

  if (!open) return null;

  const statusText = {
    idle: 'Ready to start',
    connecting: 'Connecting to AjayBot Voice…',
    connected: agentConnected ? 'Voice mode is active' : 'Connected — waiting for AjayBot agent…',
    error: 'Voice mode could not start',
  }[status] || 'Voice mode';

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-cyan text-white flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AjayBot Voice</div>
              <div className="text-[11px] text-slate-400">Realtime Gemini voice assistant</div>
            </div>
          </div>
          <button
            onClick={endVoice}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            title="Close voice mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-8 text-center">
          <div className={`mx-auto w-28 h-28 rounded-full flex items-center justify-center border transition-all ${
            status === 'connected'
              ? 'border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_60px_rgba(34,211,238,0.25)]'
              : 'border-white/10 bg-white/5'
          }`}>
            {status === 'connecting' ? (
              <Loader2 className="w-9 h-9 text-cyan-300 animate-spin" />
            ) : (
              <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center ${
                status === 'connected' ? 'animate-pulse' : ''
              }`}>
                {micEnabled ? <Mic className="w-7 h-7 text-white" /> : <MicOff className="w-7 h-7 text-white" />}
              </div>
            )}
          </div>

          <h3 className="mt-6 text-lg font-semibold text-white">
            {status === 'connected'
              ? userSpeaking
                ? 'I can hear you…'
                : agentConnected
                  ? "I'm listening, " + userName + '.'
                  : 'Waiting for AjayBot…'
              : 'Talk to AjayBot'}
          </h3>
          <p className="mt-2 text-sm text-slate-400">{statusText}</p>

          {status === 'connected' && (
            <div className="mt-3 text-[11px] text-slate-500">
              {agentConnected ? 'Agent connected' : 'Waiting for AjayBot agent…'}
              {' • '}
              {micEnabled ? 'Microphone active' : 'Microphone muted'}
            </div>
          )}

          {speakerBlocked && status === 'connected' && (
            <button
              type="button"
              onClick={enableSpeaker}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-400/15 border border-cyan-300/30 text-cyan-200 text-xs font-semibold hover:bg-cyan-400/25 inline-flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Enable speaker
            </button>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-red-950/50 border border-red-500/20 px-4 py-3 text-left text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="mt-7 flex items-center justify-center gap-3">
            {status === 'idle' || status === 'error' ? (
              <button
                onClick={startVoice}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-sm font-semibold flex items-center gap-2 shadow-brand-glow"
              >
                <Mic className="w-4 h-4" />
                Start voice
              </button>
            ) : (
              <button
                onClick={toggleMic}
                disabled={status !== 'connected'}
                className={"px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 transition disabled:opacity-40 " + (
                  micEnabled
                    ? 'bg-white/10 text-white hover:bg-white/15'
                    : 'bg-red-500/15 text-red-200 hover:bg-red-500/25'
                )}
              >
                {micEnabled ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {micEnabled ? 'Mute' : 'Unmute'}
              </button>
            )}

            <button
              onClick={endVoice}
              className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              End call
            </button>
          </div>

          <p className="mt-5 text-[11px] text-slate-500">
            Start voice to grant microphone and speaker access. The production AjayBot voice agent must be deployed in LiveKit Cloud.
          </p>
        </div>
      </div>
    </div>
  );
}
