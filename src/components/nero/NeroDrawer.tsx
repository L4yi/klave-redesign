import React, { useEffect, useMemo, useState } from 'react';
import { AudioLines, Pause, Play, Plus, TrendingUp, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BEATS, MOOD_OPTIONS } from '../../data/catalog';
import { MoodTag } from '../../types/klave';
import { formatPrice } from '../../utils/format';

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
  } = useApp();

  const [tab, setTab] = useState<'matcher' | 'insights'>('matcher');
  const [selectedMood, setSelectedMood] = useState<MoodTag>(neroInitialMood ?? 'Dark');
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    if (neroInitialMood) {
      setSelectedMood(neroInitialMood);
      setTab('matcher');
    }
  }, [neroInitialMood]);

  const recommendations = useMemo(() => {
    const query = promptText.trim().toLowerCase();
    return BEATS.map((beat) => {
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
  }, [selectedMood, promptText]);

  if (!neroOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div
        className="flex h-full w-full max-w-lg flex-col border-l shadow-2xl"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
      >
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
                Mood matching &amp; beat pricing
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

        <div className="grid grid-cols-2 border-b p-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setTab('matcher')}
            className="cursor-pointer rounded-md py-2 text-xs font-semibold transition"
            style={{
              backgroundColor: tab === 'matcher' ? 'var(--bg-elevated)' : 'transparent',
              color: tab === 'matcher' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            Mood Matcher
          </button>
          <button
            type="button"
            onClick={() => setTab('insights')}
            className="cursor-pointer rounded-md py-2 text-xs font-semibold transition"
            style={{
              backgroundColor: tab === 'insights' ? 'var(--bg-elevated)' : 'transparent',
              color: tab === 'insights' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            Pricing Guide
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'matcher' ? (
            <div className="space-y-5">
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
                  Filter by keyword (optional)
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
                  Matching Beats
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
                          {active ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                        </button>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">{beat.title}</div>
                          <div className="truncate font-mono-tech text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            {beat.producerName} · {beat.genre} · {beat.bpm} BPM · {beat.musicalKey}
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
          ) : (
            <div className="space-y-4">
              <div
                className="rounded-lg border p-4"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-bright)' }} />
                  <span>Lease vs. Trackout Pricing</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Most Afrobeats and Trap beats on KLAVE start at{' '}
                  <strong>{formatPrice(25, currency)}</strong> for MP3 leases,{' '}
                  <strong>{formatPrice(50, currency)}</strong> for WAV, and{' '}
                  <strong>{formatPrice(110, currency)}</strong> for full Trackout Stems.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
