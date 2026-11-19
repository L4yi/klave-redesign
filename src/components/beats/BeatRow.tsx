import React, { useMemo } from 'react';
import { Bookmark, Pause, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Beat } from '../../types/klave';
import { generateCoverDataUri } from '../../utils/artwork';
import { formatPrice } from '../../utils/format';

interface BeatRowProps {
  beat: Beat;
  index: number;
  showReport?: boolean;
}

export const BeatRow: React.FC<BeatRowProps> = ({ beat, index }) => {
  const {
    currentBeat,
    isPlaying,
    playBeat,
    currency,
    compactMode,
    openLicenseModal,
    navigate,
    savedBeatIds,
    toggleSaveBeat,
  } = useApp();

  const active = currentBeat?.id === beat.id;
  const playingThis = active && isPlaying;
  const isSaved = savedBeatIds.includes(beat.id);

  const coverUri = useMemo(() => generateCoverDataUri(beat.coverSeed), [beat.coverSeed]);

  return (
    <div
      className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b px-2 transition-colors md:grid-cols-[2rem_2.75rem_minmax(0,1.7fr)_minmax(0,1.1fr)_8.5rem_5.5rem_auto] md:gap-5 md:px-3 ${
        compactMode ? 'py-2' : 'py-3'
      }`}
      style={{
        borderColor: 'var(--border-subtle)',
        backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
      }}
    >
      {/* Index / Play */}
      <div className="hidden items-center justify-center md:flex">
        <button
          type="button"
          onClick={() => playBeat(beat)}
          aria-label={playingThis ? `Pause ${beat.title}` : `Play ${beat.title}`}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md font-mono-tech text-xs transition"
          style={{
            backgroundColor: playingThis ? 'var(--accent-primary)' : 'transparent',
            color: playingThis ? '#ffffff' : 'var(--text-muted)',
          }}
        >
          {playingThis ? (
            <Pause className="h-3 w-3 fill-current" />
          ) : (
            <>
              <span className="group-hover:hidden">{String(index + 1).padStart(2, '0')}</span>
              <Play
                className="hidden h-3.5 w-3.5 fill-current group-hover:block"
                style={{ color: 'var(--accent-bright)' }}
              />
            </>
          )}
        </button>
      </div>

      {/* Photographic Cover */}
      <button
        type="button"
        onClick={() => playBeat(beat)}
        aria-label={playingThis ? `Pause ${beat.title}` : `Play ${beat.title}`}
        className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md"
      >
        <img src={coverUri} alt={beat.title} className="h-full w-full object-cover" />
      </button>

      {/* Title & Producer */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => playBeat(beat)}
            className="cursor-pointer truncate text-left text-sm font-semibold tracking-tight transition-colors group-hover:text-blue-400"
            style={{ color: active ? 'var(--accent-ice)' : 'var(--text-primary)' }}
          >
            {beat.title}
          </button>
          {beat.exclusiveAvailable && (
            <span
              className="shrink-0 rounded border px-1.5 py-0.2 font-mono-tech text-[9px] font-semibold uppercase"
              style={{
                borderColor: 'var(--border-strong)',
                color: 'var(--accent-ice)',
              }}
            >
              EXCL
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <button
            type="button"
            onClick={() => navigate('producer', beat.producerId)}
            className="cursor-pointer hover:underline"
          >
            {beat.producerName}
          </button>
          <span className="font-mono-tech text-[11px]" style={{ color: 'var(--text-muted)' }}>
            · {beat.stemCount} stems
          </span>
        </div>
      </div>

      {/* Sharp Transient Mini-Waveform (Desktop) */}
      <div
        onClick={() => playBeat(beat)}
        className="hidden h-6 cursor-pointer items-center gap-[2px] md:flex"
        title="Click to audition beat"
      >
        {beat.waveform.slice(0, 40).map((val, i) => (
          <span
            key={i}
            className="w-[2px] flex-1 transition-colors"
            style={{
              height: `${Math.round(val * 92)}%`,
              backgroundColor: active ? 'var(--accent-bright)' : 'rgba(148, 163, 184, 0.22)',
            }}
          />
        ))}
      </div>

      {/* BPM & Key */}
      <div className="hidden font-mono-tech text-xs md:block" style={{ color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--text-primary)' }}>{beat.bpm}</span> BPM · {beat.musicalKey}
      </div>

      {/* Genre */}
      <div className="hidden font-mono-tech text-[11px] md:block" style={{ color: 'var(--text-muted)' }}>
        {beat.genre}
      </div>

      {/* Price & Save */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => toggleSaveBeat(beat.id)}
          aria-label={isSaved ? 'Remove from crate' : 'Save beat'}
          className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-md transition hover:opacity-80 sm:inline-flex"
          style={{ color: isSaved ? 'var(--accent-bright)' : 'var(--text-muted)' }}
        >
          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => openLicenseModal(beat)}
          className="cursor-pointer rounded-md border px-3 py-1.5 font-mono-tech text-xs font-semibold transition-all group-hover:bg-blue-600 group-hover:text-white"
          style={{
            backgroundColor: active ? 'var(--accent-primary)' : 'var(--accent-soft)',
            borderColor: 'var(--border-strong)',
            color: active ? '#ffffff' : 'var(--text-primary)',
          }}
        >
          {formatPrice(beat.licenses.mp3.priceUsd, currency)}
        </button>
      </div>
    </div>
  );
};
