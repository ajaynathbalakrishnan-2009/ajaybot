import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, X, Loader2, Radio } from 'lucide-react';
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

export default function VoiceAssistant({ open, onClose, userName = 'Ajay' }) {
  const roomRef = useRef(null);
  const audioElementsRef = useRef([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [micEnabled, setMicEnabled] = useState(false);
  const [speakerBlocked, setSpeakerBlocked] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    const connect = async () => {
      setStatus('connecting');
      setError('');

      try {
        if (!supabase) {
          throw new Error('Supabase authentication is not configured.');
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
            Authorization: `Bearer ${session.access_token}`,
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

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        roomRef.current = room;

        const handleTrackSubscribed = (track) => {
          attachAudioTrack(track, audioElementsRef.current, () => setSpeakerBlocked(true));
        };

        const handleParticipantConnected = () => {
          if (!cancelled) setAgentConnected(true);
        };

        const handleParticipantDisconnected = () => {
          if (!cancelled) setAgentConnected(false);
        };

        const handleAudioPlaybackStatus = () => {
          if (!cancelled) setSpeakerBlocked(!room.canPlaybackAudio);
        };

        room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
        room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        room.on(RoomEvent.AudioPlaybackStatusChanged, handleAudioPlaybackStatus);
        room.on(RoomEvent.Disconnected, () => {
          if (!cancelled) {
            setMicEnabled(false);
            setStatus('idle');
          }
        });

        await room.connect(connection.serverUrl, connection.participantToken);

        // Explicitly attempt to unlock audio after connecting. If the browser
        // blocks autoplay, the UI will show an Enable speaker button.
        try {
          await room.startAudio();
          setSpeakerBlocked(false);
        } catch {
          setSpeakerBlocked(true);
        }

        if (cancelled) {
          await room.disconnect();
          return;
        }

        for (const participant of room.remoteParticipants.values()) {
          for (const publication of participant.trackPublications.values()) {
            if (publication.track) attachAudioTrack(publication.track, audioElementsRef.current, () => setSpeakerBlocked(true));
          }
        }

        await room.localParticipant.setMicrophoneEnabled(true);
        setMicEnabled(true);
        setStatus('connected');
      } catch (err) {
        if (cancelled) return;
        console.error('LiveKit voice connection error:', err);
        setError(err?.message || 'Unable to start voice mode.');
        setStatus('error');
      }
    };

    connect();

    return () => {
      cancelled = true;

      const room = roomRef.current;
      roomRef.current = null;
      if (room) {
        room.removeAllListeners();
        room.disconnect();
      }

      audioElementsRef.current.forEach((element) => {
        try { element.remove(); } catch {}
      });
      audioElementsRef.current = [];
      setMicEnabled(false);
      setAgentConnected(false);
      setSpeakerBlocked(false);
      setStatus('idle');
    };
  }, [open]);

  const enableSpeaker = async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.startAudio();
      setSpeakerBlocked(false);
      audioElementsRef.current.forEach((element) => {
        element.play?.().catch(() => {});
      });
    } catch (err) {
      setError(err?.message || 'Browser blocked audio playback. Check your browser audio permissions.');
    }
  };

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room || status !== 'connected') return;

    try {
      await room.localParticipant.setMicrophoneEnabled(!micEnabled);
      setMicEnabled((value) => !value);
    } catch (err) {
      setError(err?.message || 'Could not change microphone state.');
    }
  };

  const endVoice = async () => {
    const room = roomRef.current;
    if (room) {
      room.removeAllListeners();
      await room.disconnect();
      roomRef.current = null;
    }
    onClose?.();
  };

  if (!open) return null;

  const statusText = {
    connecting: 'Connecting to AjayBot Voice…',
    connected: 'Voice mode is active',
    error: 'Voice mode could not start',
    idle: 'Voice mode is ready',
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
            {status === 'connected' ? `I'm listening, ${userName}.` : 'Talk to AjayBot'}
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
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-400/15 border border-cyan-300/30 text-cyan-200 text-xs font-semibold hover:bg-cyan-400/25"
            >
              Enable speaker
            </button>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-red-950/50 border border-red-500/20 px-4 py-3 text-left text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="mt-7 flex items-center justify-center gap-3">
            <button
              onClick={toggleMic}
              disabled={status !== 'connected'}
              className={`px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 transition disabled:opacity-40 ${
                micEnabled
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-red-500/15 text-red-200 hover:bg-red-500/25'
              }`}
            >
              {micEnabled ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {micEnabled ? 'Mute' : 'Unmute'}
            </button>

            <button
              onClick={endVoice}
              className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              End call
            </button>
          </div>

          <p className="mt-5 text-[11px] text-slate-500">
            Your browser will ask for microphone permission when voice mode starts.
          </p>
        </div>
      </div>
    </div>
  );
}
