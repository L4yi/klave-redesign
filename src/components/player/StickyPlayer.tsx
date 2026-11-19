import React, { useMemo } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateCoverDataUri } from '../../utils/artwork';
import { StemChannel } from '../../utils/audioSynth';
import { formatDuration, formatPrice } from '../../utils/format';

const STEM_LABELS: { id: StemChannel; label: string }[] = [
  { id: 'drums', label: 'DRUMS' },
  { id: 'bass', label: '808' },
  { id: 'melody', label: 'MELODY' },
  { id: 'hats', label: 'HATS' },
];

export const StickyPlayer: React.FC = () => {
  const {
    currentBeat,
    isPlaying,
    elapsedSec,
    volume,
    activeStems,
    toggleStem,
    togglePlay,
    seekTo,
    setVolume,
    nextBeat,
    prevBeat,
    currency,
    openLicenseModal,
    navigate,
  } = useApp();

  const coverUri = useMemo(() => {
    if (!currentBeat) return '';
    return generateCoverDataUri(currentBeat.coverSeed);
  }, [currentBeat]);

  if (!currentBeat) return null;

  const progressPct = Math.min(100, Math.max(0, (elapsedSec / 30) * 100));

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * 30);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-16 z-40 border-t backdrop-blur-xl md:bottom-0"
      style={{
        backgroundColor: 'var(--bg-glass)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Track Identity */}
        <div className="flex min-w-0 items-center gap-3 md:w-56">
          <img
            src={coverUri}
            alt={currentBeat.title}
            className="h-10 w-10 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0">
            <div className="truncate text-xs font-bold tracking-tight">{currentBeat.title}</div>
            <div className="flex items-center gap-1.5 truncate font-mono-tech text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              <button
                type="button"
                onClick={() => navigate('producer', currentBeat.producerId)}
                className="cursor-pointer truncate hover:underline"
              >
                {currentBeat.producerName}
              </button>
              <span style={{ color: 'var(--text-muted)' }}>· {currentBeat.bpm} BPM</span>
            </div>
          </div>
        </div>

        {/* Transport + Sharp 64-Bar Transient Waveform */}
        <div className="flex flex-1 items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevBeat}
              aria-label="Previous beat"
              className="hidden h-7 w-7 cursor-pointer items-center justify-center rounded-md transition hover:opacity-80 sm:flex"
              style={{ color: 'var(--text-secondary)' }}
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white transition hover:opacity-95"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={nextBeat}
              aria-label="Next beat"
              className="hidden h-7 w-7 cursor-pointer items-center justify-center rounded-md transition hover:opacity-80 sm:flex"
              style={{ color: 'var(--text-secondary)' }}
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="hidden font-mono-tech text-[11px] lg:inline" style={{ color: 'var(--text-muted)' }}>
            {formatDuration(elapsedSec)}
          </span>

          <div
            role="slider"
            tabIndex={0}
            aria-label="Seek preview"
            aria-valuemin={0}
            aria-valuemax={30}
            aria-valuenow={Math.round(elapsedSec)}
            onClick={handleWaveformClick}
            className="hidden h-8 flex-1 cursor-pointer items-center gap-[2px] md:flex"
          >
            {currentBeat.waveform.map((height, idx) => {
              const barPct = ((idx + 1) / currentBeat.waveform.length) * 100;
              const passed = barPct <= progressPct;
              return (
                <span
                  key={idx}
                  className="w-[2px] flex-1 transition-colors"
                  style={{
                    height: `${Math.round(height * 94)}%`,
                    backgroundColor: passed ? 'var(--accent-bright)' : 'rgba(148, 163, 184, 0.22)',
                  }}
                />
              );
            })}
          </div>

          <span className="hidden font-mono-tech text-[11px] lg:inline" style={{ color: 'var(--text-muted)' }}>
            0:30
          </span>
        </div>

        {/* Live Stem Mute Switches + Volume + License */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 xl:flex" title="Toggle live stem channels">
            {STEM_LABELS.map((stem) => {
              const on = activeStems[stem.id];
              return (
                <button
                  key={stem.id}
                  type="button"
                  onClick={() => toggleStem(stem.id)}
                  className="cursor-pointer rounded border px-1.5 py-0.5 font-mono-tech text-[10px] font-semibold transition"
                  style={{
                    backgroundColor: on ? 'var(--accent-soft)' : 'transparent',
                    borderColor: on ? 'var(--border-strong)' : 'var(--border-subtle)',
                    color: on ? 'var(--accent-ice)' : 'var(--text-muted)',
                  }}
                >
                  {stem.label}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-1.5 lg:flex">
            <Volume2 className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="h-1 w-14 cursor-pointer accent-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => openLicenseModal(currentBeat)}
            className="cursor-pointer rounded-md px-3.5 py-1.5 font-mono-tech text-xs font-semibold text-white transition hover:opacity-95"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            {formatPrice(currentBeat.licenses.mp3.priceUsd, currency)}
          </button>
        </div>
      </div>
    </div>
  );
};
