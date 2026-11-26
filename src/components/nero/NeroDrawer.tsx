import React, { useEffect, useMemo, useState } from 'react';
import {
  AudioLines,
  Pause,
  Play,
  Plus,
  TrendingUp,
  X,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOOD_OPTIONS } from '../../data/catalog';
import { MoodTag } from '../../types/klave';
import { formatPrice } from '../../utils/format';
import { askNero, NeroMessage } from '../../lib/api';

export const NeroDrawer: React.FC = () => {
  const {
    neroOpen,
    setNeroOpen,
    neroInitialMood,
    currentBeat,
    isPlaying,
    playBeat,
    openLicenseModal,
    currency,
    beats,
  } = useApp();

  const [tab, setTab] = useState<'matcher' | 'chat' | 'pricing'>('matcher');
  const [selectedMood, setSelectedMood] = useState<MoodTag>(neroInitialMood ?? 'Dark');
  const [promptText, setPromptText] = useState('');

  // Chat State
  const [chatMessages, setChatMessages] = useState<NeroMessage[]>([
    {
      role: 'assistant',
      content:
        'I am NERO, KLAVE\'s beat advisor. Ask me anything about target audience, stem arrangement, pricing tiers, or market trends.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (neroInitialMood) {
      setSelectedMood(neroInitialMood);
      setTab('matcher');
    }
  }, [neroInitialMood]);

  const recommendations = useMemo(() => {
    const query = promptText.trim().toLowerCase();
    return beats
      .map((beat) => {
        let score = beat.moods.includes(selectedMood) ? 5 : 0;
        if (query) {
          if (beat.genre.toLowerCase().includes(query)) score += 3;
          if (beat.tags.some((t) => t.toLowerCase().includes(query))) score += 3;
          if (beat.title.toLowerCase().includes(query)) score += 2;
          if (beat.producerName.toLowerCase().includes(query)) score += 2;
        }
        return { beat, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.beat.plays - a.beat.plays)
      .slice(0, 5);
  }, [selectedMood, promptText, beats]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const newMessages: NeroMessage[] = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const reply = await askNero(newMessages);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'NERO is currently upgrading. In the meantime, browse trending beats with verified stems for quick inspiration.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!neroOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div
        className="flex h-full w-full max-w-lg flex-col border-l shadow-2xl"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-ice)' }}
            >
              <AudioLines className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold">NERO</h2>
              <p className="font-mono-tech text-[11px]" style={{ color: 'var(--text-muted)' }}>
                AI Beat Advisor &amp; Matcher
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNeroOpen(false)}
            aria-label="Close NERO drawer"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 border-b p-2 gap-1" style={{ borderColor: 'var(--border-subtle)' }}>
          {[
            { id: 'matcher', label: 'Mood Matcher' },
            { id: 'chat', label: 'Ask NERO' },
            { id: 'pricing', label: 'Pricing Matrix' },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as typeof tab)}
                className="cursor-pointer rounded-md py-2 text-xs font-semibold transition"
                style={{
                  backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {tab === 'matcher' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block font-mono-tech text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
                  Pick a Vibe
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {MOOD_OPTIONS.map((mood) => {
                    const active = selectedMood === mood.id;
                    return (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => setSelectedMood(mood.id)}
                        className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold transition"
                        style={{
                          backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                          borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                          color: active ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {mood.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="nero-prompt"
                  className="block font-mono-tech text-xs uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Filter by keyword
                </label>
                <input
                  id="nero-prompt"
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="afropiano, uk drill, 808, guitar..."
                  className="mt-1.5 h-10 w-full rounded-md border px-3 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="font-mono-tech text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
                  Matching Beats ({recommendations.length})
                </div>

                {recommendations.map(({ beat }) => {
                  const active = currentBeat?.id === beat.id && isPlaying;
                  return (
                    <div
                      key={beat.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => playBeat(beat)}
                          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-white"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                        >
                          {active ? (
                            <Pause className="h-3.5 w-3.5 fill-current" />
                          ) : (
                            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">{beat.title}</div>
                          <div
                            className="truncate font-mono-tech text-[11px]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {beat.producerName} · {beat.genre} · {beat.bpm} BPM
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          openLicenseModal(beat);
                          setNeroOpen(false);
                        }}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 font-mono-tech text-xs font-semibold text-white"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      >
                        <Plus className="h-3 w-3" />
                        {formatPrice(beat.licenses.mp3.priceUsd, currency)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'chat' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 text-xs ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-ice)' }}
                      >
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-lg p-3 leading-relaxed ${
                        msg.role === 'user'
                          ? 'text-white'
                          : 'border'
                      }`}
                      style={{
                        backgroundColor:
                          msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                        borderColor:
                          msg.role === 'user' ? 'transparent' : 'var(--border-subtle)',
                        color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                      }}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                      >
                        <UserIcon className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>NERO is typing...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="border-t p-3 flex gap-2"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about target audience, pricing, or stems..."
                  className="h-10 flex-1 rounded-md border px-3 text-xs outline-none transition focus:border-blue-500"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md font-semibold text-white transition disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {tab === 'pricing' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div
                className="rounded-lg border p-4"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-bright)' }} />
                  <span>Market Standard Pricing Guide</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Pricing floors on KLAVE are strictly enforced in Firestore rules:
                </p>
                <ul className="mt-3 list-inside list-disc text-xs space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <li>
                    <strong>Standard Non-Exclusive Lease:</strong> Minimum <strong>$7</strong>. Average marketplace rate: <strong>$25 - $45</strong>.
                  </li>
                  <li>
                    <strong>Trackout Stems License:</strong> Average rate: <strong>$95 - $150</strong>. Must include verified stems.
                  </li>
                  <li>
                    <strong>Exclusive Rights Buyout:</strong> Minimum <strong>$100</strong>. Average rate: <strong>$450 - $1,200</strong>. Marks beat as sold permanently.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
