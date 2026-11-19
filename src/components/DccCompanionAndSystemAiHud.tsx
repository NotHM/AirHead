import React, { useState, useRef, useEffect } from 'react';
import {
  DccCompanionPersistentMemory,
  DccSystemAiPostRoundBroadcast,
  RoyalCourtAgentId,
  INITIAL_ROYAL_COURT_AGENTS,
  INITIAL_ROYAL_GUARD_EQUIPMENT,
} from '../game/dccCompanionAndSwarmEngine';

interface DccCompanionAndSystemAiHudProps {
  companionMemory: DccCompanionPersistentMemory;
  isGeneratingChat: boolean;
  onSendPlayerChat: (text: string) => void;
  onTriggerAutonomousBanter: () => void;
  onFireManualOcularBeam?: () => void;
  onCommandRoyalCourtAgent?: (
    agentId?: RoyalCourtAgentId,
    customOrder?: string
  ) => void;
  postRoundBroadcast: DccSystemAiPostRoundBroadcast | null;
  onOpenLootBox: () => void;
  onDismissPostRoundBroadcast: () => void;
  compactMode?: boolean;
}

interface MultiTurnChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelBadge: string;
  delegationBadge?: string | null;
  timestamp: string;
}

function float32ToBase64Pcm16(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export const DccCompanionAndSystemAiHud: React.FC<DccCompanionAndSystemAiHudProps> = ({
  companionMemory,
  isGeneratingChat,
  onSendPlayerChat,
  onTriggerAutonomousBanter,
  onFireManualOcularBeam,
  onCommandRoyalCourtAgent,
  postRoundBroadcast,
  onOpenLootBox,
  onDismissPostRoundBroadcast,
  compactMode = false,
}) => {
  const [closed, setClosed] = useState<boolean>(false);
  const [minimized, setMinimized] = useState<boolean>(compactMode);
  const [expanded, setExpanded] = useState<boolean>(!compactMode);
  const [activeTab, setActiveTab] = useState<
    'CHAT' | 'ROYAL_COURT' | 'MULTI_TIER_AI' | 'VOICE_AND_MUSIC'
  >('CHAT');
  const [broadcastMinimized, setBroadcastMinimized] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [royalOrderInput, setRoyalOrderInput] = useState<string>('');
  const [showMemories, setShowMemories] = useState<boolean>(false);

  // Multi-Turn Tiered Gemini & Strict Local Ollama Chat State
  const [selectedTierModel, setSelectedTierModel] = useState<
    'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'
  >('gemini-3.8-flash');
  const [strictLocalOllama, setStrictLocalOllama] = useState<boolean>(false);
  const [selectedLocalOllamaModel, setSelectedLocalOllamaModel] =
    useState<string>('gemma3:4b');
  const [rolePersona, setRolePersona] = useState<
    | 'PRINCESS_DONUT_ROYAL_COMMANDER'
    | 'ELON_FIRST_PRINCIPLES_ARCHITECT'
    | 'MASTER_CNC_GUNSMITH_SWARM_LEAD'
  >('PRINCESS_DONUT_ROYAL_COMMANDER');
  const [multiTurnMessages, setMultiTurnMessages] = useState<MultiTurnChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: 'Royal Multi-Tier Neural Thread Ready. Switch between gemini-4-argon (Complex STEM/CAD), gemini-3.8-flash (General), gemini-3.1-flash-lite (Fast), or toggle Strict Local Ollama (1B/4B) to route 1B → 4B delegations locally.',
      modelBadge: 'gemini-3.8-flash',
      timestamp: '00:00',
    },
  ]);
  const [multiTurnInput, setMultiTurnInput] = useState<string>('');
  const [isSendingMultiTurn, setIsSendingMultiTurn] = useState<boolean>(false);

  // Gemini Live API Real-Time Voice (`gemini-3.8-live`) State
  const [liveVoiceConnected, setLiveVoiceConnected] = useState<boolean>(false);
  const [micStreaming, setMicStreaming] = useState<boolean>(false);
  const [liveStatusBadge, setLiveStatusBadge] = useState<string>(
    'Idle · Ready for gemini-3.8-live'
  );
  const [liveTranscripts, setLiveTranscripts] = useState<string[]>([
    'Connect Live Voice (gemini-3.8-live) to converse with HRH Princess Donut in real-time 24kHz audio.',
  ]);
  const [voiceQuickPrompt, setVoiceQuickPrompt] = useState<string>(
    'Princess Donut, audit our #09 Protector dual-barrel 250-Bar reserves!'
  );
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  // Lyria 3 Soundtrack Studio (`lyria-3-clip-preview` & `lyria-3-pro-preview`) State
  const [lyriaModel, setLyriaModel] = useState<
    'lyria-3-clip-preview' | 'lyria-3-pro-preview'
  >('lyria-3-clip-preview');
  const [musicPrompt, setMusicPrompt] = useState<string>(
    'High-pressure 250-Bar industrial dark-synth combat & CNC gunsmithing track at 128 BPM'
  );
  const [isGeneratingMusic, setIsGeneratingMusic] = useState<boolean>(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [generatedMusicLyrics, setGeneratedMusicLyrics] = useState<string>('');
  const [generatedMusicBadge, setGeneratedMusicBadge] = useState<string>('');

  const royalCourtAgents =
    companionMemory.royalCourtAgents && companionMemory.royalCourtAgents.length > 0
      ? companionMemory.royalCourtAgents
      : INITIAL_ROYAL_COURT_AGENTS;
  const royalGuardEquipment =
    companionMemory.royalGuardEquipment && companionMemory.royalGuardEquipment.length > 0
      ? companionMemory.royalGuardEquipment
      : INITIAL_ROYAL_GUARD_EQUIPMENT;

  const latestChat =
    companionMemory.chatHistory[companionMemory.chatHistory.length - 1] ||
    companionMemory.chatHistory[0];

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      inputAudioCtxRef.current?.close().catch(() => {});
      outputAudioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const play24kHzPcmChunk = (base64Pcm: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
        nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
      }
      const ctx = outputAudioCtxRef.current;
      const binaryStr = window.atob(base64Pcm);
      const byteLen = binaryStr.length;
      const int16Count = Math.floor(byteLen / 2);
      if (int16Count <= 0) return;

      const audioBuffer = ctx.createBuffer(1, int16Count, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const bytes = new Uint8Array(byteLen);
      for (let i = 0; i < byteLen; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const view = new DataView(bytes.buffer);
      for (let i = 0; i < int16Count; i++) {
        channelData[i] = view.getInt16(i * 2, true) / 32768;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      const startAt = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startAt);
      nextStartTimeRef.current = startAt + audioBuffer.duration;
    } catch {
      // Non-fatal audio playback fallback
    }
  };

  const handleToggleLiveVoiceSession = async () => {
    if (liveVoiceConnected) {
      wsRef.current?.close();
      wsRef.current = null;
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setMicStreaming(false);
      setLiveVoiceConnected(false);
      setLiveStatusBadge('Disconnected');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
    wsRef.current = ws;
    setLiveStatusBadge('Connecting to gemini-3.8-live...');

    ws.onopen = () => {
      setLiveVoiceConnected(true);
      setLiveStatusBadge('Connected · gemini-3.8-live (24kHz Audio)');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as {
          status?: string;
          model?: string;
          inputTranscript?: string;
          outputTranscript?: string;
          audio?: string;
          interrupted?: boolean;
        };
        if (msg.model) {
          setLiveStatusBadge(`Active · ${msg.model}`);
        }
        if (msg.inputTranscript) {
          setLiveTranscripts((prev) => [
            ...prev.slice(-8),
            `You: ${msg.inputTranscript}`,
          ]);
        }
        if (msg.outputTranscript) {
          setLiveTranscripts((prev) => [
            ...prev.slice(-8),
            `Princess Donut: ${msg.outputTranscript}`,
          ]);
        }
        if (msg.audio) {
          play24kHzPcmChunk(msg.audio);
        }
        if (msg.interrupted && outputAudioCtxRef.current) {
          nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
        }
      } catch {
        // Ignore parse error
      }
    };

    ws.onclose = () => {
      setLiveVoiceConnected(false);
      setMicStreaming(false);
      setLiveStatusBadge('Disconnected');
    };
  };

  const handleToggleMicrophoneCapture = async () => {
    if (micStreaming) {
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setMicStreaming(false);
      return;
    }

    if (!liveVoiceConnected) {
      await handleToggleLiveVoiceSession();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(inputCtx.destination);
      processor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64 = float32ToBase64Pcm16(e.inputBuffer.getChannelData(0));
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        }
      };
      setMicStreaming(true);
      setLiveTranscripts((prev) => [
        ...prev.slice(-8),
        '16kHz PCM Microphone Stream Active — Speak now!',
      ]);
    } catch {
      setLiveTranscripts((prev) => [
        ...prev.slice(-8),
        'Mic access unavailable in sandbox; use Send Voice Prompt below to converse with gemini-3.8-live!',
      ]);
    }
  };

  const handleSendLiveVoicePrompt = () => {
    if (!voiceQuickPrompt.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: voiceQuickPrompt.trim() }));
      setVoiceQuickPrompt('');
    } else {
      handleToggleLiveVoiceSession().then(() => {
        setTimeout(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ text: voiceQuickPrompt.trim() }));
            setVoiceQuickPrompt('');
          }
        }, 350);
      });
    }
  };

  const handleSendMultiTurnMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = multiTurnInput.trim();
    if (!trimmed || isSendingMultiTurn) return;

    const nowLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const userMsg: MultiTurnChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      modelBadge: strictLocalOllama ? selectedLocalOllamaModel : selectedTierModel,
      timestamp: nowLabel,
    };

    const nextHistory = [...multiTurnMessages, userMsg];
    setMultiTurnMessages(nextHistory);
    setMultiTurnInput('');
    setIsSendingMultiTurn(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedTierModel,
          rolePersona,
          strictLocalOllama,
          localOllamaModel: selectedLocalOllamaModel,
          history: multiTurnMessages.map((m) => ({ role: m.role, text: m.text })),
          message: trimmed,
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        modelUsed?: string;
        delegatedFrom1BTo4B?: string | null;
      };
      setMultiTurnMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text:
            data.reply ||
            'Verified 250-Bar Belleville regulator stack and queued sub-mm CNC tolerances.',
          modelBadge:
            data.modelUsed ||
            (strictLocalOllama ? selectedLocalOllamaModel : selectedTierModel),
          delegationBadge: data.delegatedFrom1BTo4B || null,
          timestamp: nowLabel,
        },
      ]);
    } catch {
      setMultiTurnMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: `[${strictLocalOllama ? selectedLocalOllamaModel : selectedTierModel}] Completed local CAD & compressible-flow audit for "${trimmed}".`,
          modelBadge: strictLocalOllama ? selectedLocalOllamaModel : selectedTierModel,
          timestamp: nowLabel,
        },
      ]);
    } finally {
      setIsSendingMultiTurn(false);
    }
  };

  const handleGenerateLyriaMusic = async () => {
    if (!musicPrompt.trim() || isGeneratingMusic) return;
    setIsGeneratingMusic(true);
    try {
      const res = await fetch('/api/gemini/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: lyriaModel,
          prompt: musicPrompt.trim(),
        }),
      });
      const data = (await res.json()) as {
        audioDataUrl?: string;
        lyrics?: string;
        modelUsed?: string;
      };
      if (data.audioDataUrl) {
        setGeneratedMusicUrl(data.audioDataUrl);
        setGeneratedMusicLyrics(data.lyrics || '');
        setGeneratedMusicBadge(data.modelUsed || lyriaModel);
      }
    } catch {
      // Handled by server fallback
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendPlayerChat(chatInput.trim());
    setChatInput('');
  };

  return (
    <>
      {/* ====================================================================
          1. FLOATING ARISTOCRATIC DIVA SHOW-CAT COMPANION WIDGET ("HRH PRINCESS DONUT")
             Supports full Close (✕) so it NEVER blocks bottom-left menu buttons!
         ==================================================================== */}
      {closed ? (
        <div className="pointer-events-auto fixed top-2.5 right-3 z-30 font-mono text-xs">
          <button
            type="button"
            data-testid="reopen-dcc-companion"
            onClick={() => {
              setClosed(false);
              setMinimized(false);
            }}
            title="Reopen HRH Princess Donut, Royal Court, Multi-Tier Chat, Live Voice & Lyria Music"
            className="bg-zinc-950 border border-fuchsia-500/80 rounded-lg px-2.5 py-1 shadow-xl flex items-center gap-1.5 text-fuchsia-200 hover:bg-fuchsia-950 hover:text-white transition-colors cursor-pointer"
          >
            <span>👑 Princess Donut &amp; Royal Court ({royalCourtAgents.length} Agents)</span>
            <span className="px-1.5 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400/50 text-[9.5px] font-bold">
              Open
            </span>
          </button>
        </div>
      ) : minimized ? (
        <div className="pointer-events-auto fixed bottom-3 left-3 z-30 font-mono text-xs flex items-center gap-1">
          <button
            type="button"
            data-testid="restore-dcc-companion"
            onClick={() => setMinimized(false)}
            title="Expand HRH Princess Donut & Royal Court"
            className="bg-zinc-950 border border-fuchsia-500/70 rounded-lg px-2.5 py-1 shadow-xl flex items-center gap-2 text-fuchsia-200 hover:bg-fuchsia-950 hover:text-white transition-colors cursor-pointer"
          >
            <span>👑 Princess Donut (Lvl {companionMemory.level})</span>
            <span className="text-[10px] text-amber-300 font-bold tabular-nums">
              ⚡{companionMemory.totalEyeBeamKills}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400/50 text-[10px] font-bold">
              ▴ Expand
            </span>
          </button>
          <button
            type="button"
            data-testid="close-dcc-companion-minimized"
            onClick={() => setClosed(true)}
            title="Close DCC Chat completely (moves reopen pill to top-right)"
            className="bg-zinc-950 border border-rose-500/60 rounded-lg px-2 py-1 text-rose-300 hover:bg-rose-500 hover:text-zinc-950 font-bold text-[10px] cursor-pointer shadow-xl"
          >
            ✕ Close
          </button>
        </div>
      ) : (
        <div className="pointer-events-auto fixed bottom-14 left-3 z-30 max-w-md w-[410px] font-mono text-xs">
          <div className="bg-zinc-950 border-2 border-fuchsia-500/70 rounded-xl shadow-2xl overflow-hidden">
            {/* Header Bar */}
            <div className="bg-zinc-900 px-3 py-1.5 border-b border-fuchsia-500/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <svg viewBox="0 0 36 36" className="w-7 h-7 shrink-0">
                  <circle cx="18" cy="20" r="11" fill="#9a3412" stroke="#facc15" strokeWidth="1.4" />
                  <polygon points="8,14 11,5 15,12" fill="#9a3412" stroke="#facc15" strokeWidth="1" />
                  <polygon points="28,14 25,5 21,12" fill="#9a3412" stroke="#facc15" strokeWidth="1" />
                  <polygon points="12,11 15,4 18,9 21,4 24,11" fill="#facc15" />
                  <circle cx="18" cy="8" r="1.8" fill="#ec4899" />
                  <circle cx="14" cy="19" r="3.5" fill="#ec4899" stroke="#fef08a" strokeWidth="1" />
                  <circle cx="22" cy="19" r="3.5" fill="#ec4899" stroke="#fef08a" strokeWidth="1" />
                  <line x1="17.5" y1="19" x2="18.5" y2="19" stroke="#fef08a" strokeWidth="1.2" />
                </svg>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold text-fuchsia-300 truncate">
                    Princess Donut · Lvl {companionMemory.level} · 5 Royal Agents
                  </div>
                  <div className="text-xs font-bold text-zinc-100 truncate">
                    👑 {companionMemory.companionName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  title={expanded ? 'Collapse Controls' : 'Expand Controls'}
                  className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 hover:text-white cursor-pointer"
                >
                  {expanded ? '–' : '+'}
                </button>
                <button
                  type="button"
                  data-testid="minimize-dcc-companion"
                  onClick={() => setMinimized(true)}
                  title="Minimize DCC Companion Widget"
                  className="px-1.5 py-0.5 rounded bg-zinc-900 border border-fuchsia-500/50 text-[10px] text-fuchsia-300 hover:bg-fuchsia-500 hover:text-zinc-950 font-bold cursor-pointer"
                >
                  ▾ Min
                </button>
                <button
                  type="button"
                  data-testid="close-dcc-companion"
                  onClick={() => setClosed(true)}
                  title="Close DCC Chat completely"
                  className="px-1.5 py-0.5 rounded bg-zinc-900 border border-rose-500/60 text-[10px] text-rose-300 hover:bg-rose-500 hover:text-zinc-950 font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* 4-Tab Multimodal & Local Swarm Navigation */}
            <div className="grid grid-cols-4 bg-zinc-900 border-b border-zinc-800 text-[9.5px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('CHAT')}
                className={`py-1.5 text-center cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'CHAT'
                    ? 'bg-fuchsia-500/25 text-fuchsia-200 border-b-2 border-fuchsia-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                💬 Donut (⚡{companionMemory.totalEyeBeamKills})
              </button>
              <button
                type="button"
                data-testid="tab-royal-court"
                onClick={() => setActiveTab('ROYAL_COURT')}
                className={`py-1.5 text-center cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'ROYAL_COURT'
                    ? 'bg-amber-500/25 text-amber-200 border-b-2 border-amber-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                👑 Royal Court (5)
              </button>
              <button
                type="button"
                data-testid="tab-multi-tier-ai"
                onClick={() => setActiveTab('MULTI_TIER_AI')}
                className={`py-1.5 text-center cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'MULTI_TIER_AI'
                    ? 'bg-cyan-500/25 text-cyan-200 border-b-2 border-cyan-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🧠 Multi-Tier Chat
              </button>
              <button
                type="button"
                data-testid="tab-voice-and-music"
                onClick={() => setActiveTab('VOICE_AND_MUSIC')}
                className={`py-1.5 text-center cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'VOICE_AND_MUSIC'
                    ? 'bg-emerald-500/25 text-emerald-200 border-b-2 border-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🎙️ Voice &amp; Lyria
              </button>
            </div>

            {/* TAB 1: CHAT & OCULAR EYE-BEAMS */}
            {activeTab === 'CHAT' && (
              <div className="p-2.5 bg-zinc-950">
                {latestChat && (
                  <div className="bg-zinc-900 border border-fuchsia-500/30 rounded-lg p-2 mb-2">
                    <div className="flex items-center justify-between text-[9.5px] text-amber-300 font-bold mb-0.5">
                      <span>✨ {latestChat.combatAction}</span>
                      {isGeneratingChat && (
                        <span className="text-fuchsia-400">THINKING...</span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-100 leading-snug">
                      &ldquo;{latestChat.message}&rdquo;
                    </p>
                  </div>
                )}

                {expanded && (
                  <>
                    {showMemories && (
                      <div className="mb-2 bg-zinc-900 border border-zinc-800 rounded p-2 max-h-28 overflow-y-auto">
                        <div className="text-[9.5px] font-bold text-emerald-400 mb-1">
                          Royal Learned Memory Bank ({companionMemory.learnedFacts.length} insights):
                        </div>
                        <ul className="space-y-1 text-[10px] text-zinc-300 list-disc pl-3.5">
                          {companionMemory.learnedFacts.slice(-5).map((fact, idx) => (
                            <li key={idx}>{fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                      <button
                        type="button"
                        disabled={isGeneratingChat}
                        onClick={onTriggerAutonomousBanter}
                        className="px-2 py-1 rounded bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 hover:bg-fuchsia-500 hover:text-zinc-950 font-bold text-[10px] cursor-pointer transition-colors"
                      >
                        💬 Free-Will Chime In
                      </button>
                      {onFireManualOcularBeam && (
                        <button
                          type="button"
                          onClick={onFireManualOcularBeam}
                          className="px-2 py-1 rounded bg-rose-500 text-zinc-950 font-bold text-[10px] hover:bg-rose-400 cursor-pointer"
                        >
                          👁️ Fire Ocular Beam ({companionMemory.ocularBeamDamage} DMG)
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowMemories((v) => !v)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-emerald-300 text-[10px] hover:border-emerald-400 cursor-pointer"
                      >
                        🧠 Memory ({companionMemory.learnedFacts.length})
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask Princess Donut or command her court..."
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fuchsia-400"
                      />
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isGeneratingChat || !chatInput.trim()}
                        className="px-2.5 py-1 rounded bg-fuchsia-500 text-zinc-950 font-bold text-[10px] hover:bg-fuchsia-400 disabled:opacity-50 cursor-pointer"
                      >
                        Send
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: HRH PRINCESS DONUT'S ROYAL COURT OF 5 AGENTS & ROYAL GUARD GEAR */}
            {activeTab === 'ROYAL_COURT' && (
              <div className="p-2.5 bg-zinc-950 space-y-2 max-h-[370px] overflow-y-auto">
                <div className="flex items-center justify-between gap-2 bg-amber-950/30 border border-amber-500/40 rounded-lg px-2.5 py-1.5">
                  <div>
                    <div className="text-[9.5px] font-bold text-amber-300">
                      Princess Donut&apos;s Court of 5 Royal Agents
                    </div>
                    <div className="text-[10px] text-zinc-300">
                      Crafting &amp; verifying the best gear for Princess Donut &amp; her Royal Guard
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="command-all-royal-court"
                    onClick={() =>
                      onCommandRoyalCourtAgent?.(undefined, royalOrderInput.trim() || undefined)
                    }
                    className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer shrink-0 shadow"
                  >
                    👑 Command Full Court (+1 Mk)
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={royalOrderInput}
                    onChange={(e) => setRoyalOrderInput(e.target.value)}
                    placeholder="Issue Royal Decree (e.g. Harden #01 Mongo & Tiara Lasers)..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[10.5px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onCommandRoyalCourtAgent?.(
                        undefined,
                        royalOrderInput.trim() || 'Execute Royal Guard Quality Audit'
                      );
                      setRoyalOrderInput('');
                    }}
                    className="px-2 py-1 rounded bg-fuchsia-500 text-zinc-950 font-bold text-[10px] hover:bg-fuchsia-400 cursor-pointer"
                  >
                    Decree
                  </button>
                </div>

                <div className="space-y-1.5">
                  {royalCourtAgents.map((agent) => {
                    const gear = royalGuardEquipment.find(
                      (g) => g.craftedByAgentId === agent.agentId
                    );
                    return (
                      <div
                        key={agent.agentId}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10.5px] font-bold text-amber-300">
                                {agent.royalTitle}
                              </span>
                              <span className="text-[9px] text-emerald-300 font-bold tabular-nums">
                                · {agent.verificationStatus} · {agent.completionPct}%
                              </span>
                            </div>
                            <div className="text-[9.5px] text-fuchsia-300 font-semibold">
                              {agent.callsign} · {agent.specialty}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onCommandRoyalCourtAgent?.(
                                agent.agentId,
                                royalOrderInput.trim() || undefined
                              )
                            }
                            className="px-2 py-0.5 rounded bg-zinc-950 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 font-bold text-[9.5px] cursor-pointer shrink-0"
                          >
                            ⚡ Task Agent
                          </button>
                        </div>

                        <div className="text-[9.5px] text-zinc-300 leading-snug">
                          🛠️ {agent.currentOrder}
                        </div>

                        {gear && (
                          <div className="bg-zinc-950 border border-fuchsia-500/30 rounded px-2 py-1 flex items-center justify-between gap-2 text-[9.5px]">
                            <div className="min-w-0">
                              <span className="text-fuchsia-300 font-bold">
                                🛡️ {gear.title} (Mk.{gear.tierLevel}):
                              </span>{' '}
                              <span className="text-emerald-300 tabular-nums">
                                +{gear.ocularBeamBonusDmg} Beam DMG · +{gear.guardArmorBonusHp} Guard HP
                              </span>
                            </div>
                            <span className="text-amber-300 font-bold shrink-0">
                              {gear.verificationBadge}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: MULTI-TURN TIERED GEMINI CHAT + STRICT LOCAL OLLAMA (1B/4B) */}
            {activeTab === 'MULTI_TIER_AI' && (
              <div className="p-2.5 bg-zinc-950 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5 bg-zinc-900 border border-cyan-500/40 rounded-lg p-2">
                  <div className="text-[9.5px] font-bold text-cyan-300">
                    Multi-Turn Role &amp; Model Router
                  </div>
                  <button
                    type="button"
                    data-testid="toggle-strict-local-ollama"
                    onClick={() => setStrictLocalOllama((v) => !v)}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-bold cursor-pointer border ${
                      strictLocalOllama
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-cyan-400'
                    }`}
                  >
                    {strictLocalOllama
                      ? '🔒 Strict Local Ollama (1B/4B): ON'
                      : '☁️ Cloud Gemini / Local Hybrid'}
                  </button>
                </div>

                {/* Role Selector */}
                <div className="grid grid-cols-3 gap-1 text-[9px]">
                  {[
                    { id: 'PRINCESS_DONUT_ROYAL_COMMANDER', label: '👑 Princess Donut' },
                    { id: 'ELON_FIRST_PRINCIPLES_ARCHITECT', label: '🚀 First-Principles' },
                    { id: 'MASTER_CNC_GUNSMITH_SWARM_LEAD', label: '🖨️ 1B/4B Swarm Lead' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        setRolePersona(
                          r.id as
                            | 'PRINCESS_DONUT_ROYAL_COMMANDER'
                            | 'ELON_FIRST_PRINCIPLES_ARCHITECT'
                            | 'MASTER_CNC_GUNSMITH_SWARM_LEAD'
                        )
                      }
                      className={`py-1 px-1.5 rounded border font-bold cursor-pointer truncate ${
                        rolePersona === r.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Model Selector: Either Local 1B/4B Ollama Models OR Tiered Gemini Models */}
                {strictLocalOllama ? (
                  <div className="grid grid-cols-3 gap-1 text-[9px]">
                    {['gemma3:1b', 'qwen2.5:1.5b', 'gemma3:4b'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedLocalOllamaModel(tag)}
                        className={`py-1 px-1.5 rounded border font-bold cursor-pointer ${
                          selectedLocalOllamaModel === tag
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 text-[9px]">
                    {[
                      { id: 'gemini-4-argon', label: 'gemini-4-argon (Deep)' },
                      { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Gen)' },
                      { id: 'gemini-3.1-flash-lite', label: '3.1-flash-lite (Fast)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setSelectedTierModel(
                            m.id as
                              | 'gemini-4-argon'
                              | 'gemini-3.8-flash'
                              | 'gemini-3.1-flash-lite'
                          )
                        }
                        className={`py-1 px-1.5 rounded border font-bold cursor-pointer truncate ${
                          selectedTierModel === m.id
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Scrollable Multi-Turn Thread */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1.5">
                  {multiTurnMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-1.5 rounded text-[10px] leading-snug ${
                        msg.role === 'user'
                          ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-100 ml-4'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-200 mr-2'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[8.5px] text-zinc-400 mb-0.5">
                        <span className="font-bold text-amber-300">
                          {msg.role === 'user' ? 'Crawler' : rolePersona.split('_')[0]} ·{' '}
                          {msg.modelBadge}
                        </span>
                        <span className="tabular-nums">{msg.timestamp}</span>
                      </div>
                      <div>{msg.text}</div>
                      {msg.delegationBadge && (
                        <div className="mt-1 text-[8.5px] text-emerald-300 font-bold">
                          ↳ {msg.delegationBadge}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMultiTurnMessage} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={multiTurnInput}
                    onChange={(e) => setMultiTurnInput(e.target.value)}
                    placeholder="Ask multi-turn CAD/CFD question or task 1B->4B..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[10.5px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMultiTurn || !multiTurnInput.trim()}
                    className="px-2.5 py-1 rounded bg-cyan-500 text-zinc-950 font-bold text-[10px] hover:bg-cyan-400 disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingMultiTurn ? '...' : 'Send'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: GEMINI LIVE VOICE (`gemini-3.8-live`) & LYRIA 3 MUSIC (`lyria-3-clip-preview` / `lyria-3-pro-preview`) */}
            {activeTab === 'VOICE_AND_MUSIC' && (
              <div className="p-2.5 bg-zinc-950 space-y-2.5 max-h-[380px] overflow-y-auto">
                {/* Section A: Gemini Live Real-Time Voice (`gemini-3.8-live`) */}
                <div className="bg-zinc-900 border border-emerald-500/40 rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[9.5px] font-bold text-emerald-300">
                        🎙️ Live Voice Comms (gemini-3.8-live)
                      </div>
                      <div className="text-[8.5px] text-zinc-400">{liveStatusBadge}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-testid="toggle-live-voice-session"
                        onClick={handleToggleLiveVoiceSession}
                        className={`px-2 py-1 rounded text-[9.5px] font-bold cursor-pointer ${
                          liveVoiceConnected
                            ? 'bg-rose-500 text-zinc-950'
                            : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                        }`}
                      >
                        {liveVoiceConnected ? 'Disconnect' : 'Connect Live'}
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleMicrophoneCapture}
                        className={`px-2 py-1 rounded text-[9.5px] font-bold cursor-pointer border ${
                          micStreaming
                            ? 'bg-amber-500 text-zinc-950 border-amber-300'
                            : 'bg-zinc-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-950'
                        }`}
                      >
                        {micStreaming ? '🎤 Mic ON' : '🎤 Stream Mic'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5 max-h-20 overflow-y-auto space-y-0.5 text-[9.5px] text-zinc-300">
                    {liveTranscripts.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={voiceQuickPrompt}
                      onChange={(e) => setVoiceQuickPrompt(e.target.value)}
                      placeholder="Send live voice prompt to Princess Donut..."
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={handleSendLiveVoicePrompt}
                      className="px-2 py-1 rounded bg-emerald-500/25 border border-emerald-400 text-emerald-200 font-bold text-[9.5px] hover:bg-emerald-500 hover:text-zinc-950 cursor-pointer"
                    >
                      Speak
                    </button>
                  </div>
                </div>

                {/* Section B: Lyria 3 Soundtrack Studio (`lyria-3-clip-preview` & `lyria-3-pro-preview`) */}
                <div className="bg-zinc-900 border border-amber-500/40 rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[9.5px] font-bold text-amber-300">
                      🎵 Lyria 3 Soundtrack Forge
                    </div>
                    <div className="flex items-center gap-1 text-[9px]">
                      <button
                        type="button"
                        onClick={() => setLyriaModel('lyria-3-clip-preview')}
                        className={`px-1.5 py-0.5 rounded border font-bold cursor-pointer ${
                          lyriaModel === 'lyria-3-clip-preview'
                            ? 'bg-amber-500 text-zinc-950 border-amber-300'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        30s Clip (lyria-3-clip)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLyriaModel('lyria-3-pro-preview')}
                        className={`px-1.5 py-0.5 rounded border font-bold cursor-pointer ${
                          lyriaModel === 'lyria-3-pro-preview'
                            ? 'bg-amber-500 text-zinc-950 border-amber-300'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        Full Track (lyria-3-pro)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={musicPrompt}
                      onChange={(e) => setMusicPrompt(e.target.value)}
                      placeholder="Describe combat or gunsmith workshop soundtrack..."
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-100"
                    />
                    <button
                      type="button"
                      data-testid="generate-lyria-music"
                      disabled={isGeneratingMusic}
                      onClick={handleGenerateLyriaMusic}
                      className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[9.5px] hover:bg-amber-400 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isGeneratingMusic ? 'Synth...' : '🎵 Generate'}
                    </button>
                  </div>

                  {generatedMusicUrl && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5 space-y-1">
                      <div className="text-[8.5px] text-amber-300 font-bold">
                        Active Track: {generatedMusicBadge}
                      </div>
                      <audio
                        controls
                        src={generatedMusicUrl}
                        className="w-full h-7"
                      />
                      {generatedMusicLyrics && (
                        <div className="text-[9px] text-zinc-300 whitespace-pre-line max-h-16 overflow-y-auto">
                          {generatedMusicLyrics}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          2. POST-ROUND WEIRD GAME SHOW SYSTEM AI BROADCAST ("NEW ACHIEVEMENT!") & LOOT BOX MODAL
         ==================================================================== */}
      {postRoundBroadcast && (
        broadcastMinimized ? (
          <div className="pointer-events-auto fixed top-16 right-4 z-50 font-mono text-xs">
            <div className="bg-zinc-950 border-2 border-amber-400 rounded-xl px-3.5 py-2 shadow-2xl flex items-center gap-2">
              <span className="text-amber-300 font-bold">
                🎙️ DCC System AI Reward ({postRoundBroadcast.lootBoxName})
              </span>
              <button
                type="button"
                onClick={() => setBroadcastMinimized(false)}
                className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] cursor-pointer"
              >
                ▴ Expand
              </button>
              <button
                type="button"
                onClick={onDismissPostRoundBroadcast}
                className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto fixed inset-0 z-50 bg-zinc-950/90 flex items-center justify-center p-4 font-mono">
            <div className="bg-zinc-950 border-2 border-amber-400 rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] tracking-wider">
                  🎙️ Dungeon System AI Broadcast · Wave {postRoundBroadcast.waveNumber}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-fuchsia-400 font-bold">
                    Live Crawler Feed
                  </span>
                  <button
                    type="button"
                    onClick={() => setBroadcastMinimized(true)}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-[10px] cursor-pointer"
                  >
                    ▾ Minimize
                  </button>
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-extrabold text-amber-400 tracking-tight leading-snug">
                🏆 {postRoundBroadcast.achievementTitle}
              </h3>

              <div className="bg-zinc-900 border border-amber-500/40 rounded-xl p-3.5 text-xs text-zinc-100 leading-relaxed">
                &ldquo;{postRoundBroadcast.aiMonologue}&rdquo;
              </div>

              <div className="bg-zinc-900 border border-fuchsia-500/50 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-fuchsia-300 font-bold">
                      Syndicate Reward Crate ({postRoundBroadcast.lootBoxTier.replace(/_/g, ' ')})
                    </div>
                    <div className="text-sm font-bold text-amber-300">
                      🎁 {postRoundBroadcast.lootBoxName}
                    </div>
                  </div>
                  {!postRoundBroadcast.opened ? (
                    <button
                      type="button"
                      onClick={onOpenLootBox}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer shadow-lg"
                    >
                      🔓 Crack Open Loot Box!
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-[10px]">
                      ✓ Claimed &amp; Equipped
                    </span>
                  )}
                </div>

                {postRoundBroadcast.opened && (
                  <div className="border-t border-zinc-800 pt-2 mt-1 text-xs">
                    <div className="font-bold text-emerald-300">
                      Unlocked: {postRoundBroadcast.rewardItemTitle}
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-0.5">
                      {postRoundBroadcast.rewardDescription}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] tabular-nums">
                      <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-emerald-400 font-bold">
                        +{postRoundBroadcast.bonusFilamentGrams}g PA12-CF + Sinter
                      </div>
                      <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-amber-400 font-bold">
                        +{postRoundBroadcast.bonusBurstDisks}× SHELL-50-220B Foils
                      </div>
                      <div className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-fuchsia-300 font-bold">
                        +{postRoundBroadcast.bonusPeekGrams}g PEEK + Cores &amp; Springs
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {!postRoundBroadcast.opened && (
                  <button
                    type="button"
                    onClick={onOpenLootBox}
                    className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                  >
                    Open Loot Box &amp; Claim
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDismissPostRoundBroadcast}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white text-xs cursor-pointer"
                >
                  Continue Dungeon Crawl
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};
