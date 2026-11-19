import React, { useMemo } from 'react';
import { Bookmark, Pause, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Beat } from '../../types/klave';
import { generateCoverDataUri } from '../../utils/artwork';
import { formatPrice } from '../../utils/format';

interface BeatCardProps {
  beat: Beat;
}

export const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  const {
    currentBeat,
    isPlaying,
    playBeat,
    currency,
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
    <article className="group flex flex-col gap-2.5">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg border transition-all"
        style={{
          borderColor: active ? 'var(--accent-bright)' : 'var(--border-subtle)',
        }}
      >
        <img
          src={coverUri}
          alt={beat.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between">
          <span
            className="rounded px-2 py-0.5 font-mono-tech text-[10px] font-medium backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(6, 7, 10, 0.78)',
              color: '#f8fafc',
            }}
          >
            {beat.bpm} BPM · {beat.musicalKey}
          </span>

          <button
            type="button"
            onClick={() => toggleSaveBeat(beat.id)}
            aria-label={isSaved ? 'Remove from crate' : 'Save beat'}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded backdrop-blur-md transition"
            style={{
              backgroundColor: 'rgba(6, 7, 10, 0.78)',
              color: isSaved ? '#60a5fa' : '#f8fafc',
            }}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => playBeat(beat)}
          aria-label={playingThis ? `Pause ${beat.title}` : `Play ${beat.title}`}
          className={`absolute right-2.5 bottom-2.5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white shadow-lg transition-all ${
            playingThis
              ? 'opacity-100'
              : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
          }`}
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          {playingThis ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => playBeat(beat)}
            className="block cursor-pointer truncate text-left text-sm font-bold tracking-tight hover:text-blue-400"
            style={{ color: 'var(--text-primary)' }}
          >
            {beat.title}
          </button>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <button
              type="button"
              onClick={() => navigate('producer', beat.producerId)}
              className="cursor-pointer truncate hover:underline"
            >
              {beat.producerName}
            </button>
            <span className="font-mono-tech text-[10px]" style={{ color: 'var(--text-muted)' }}>
              · {beat.stemCount} stems
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openLicenseModal(beat)}
          className="shrink-0 cursor-pointer rounded-md border px-2.5 py-1 font-mono-tech text-xs font-semibold transition hover:bg-blue-600 hover:text-white"
          style={{
            backgroundColor: 'var(--accent-soft)',
            borderColor: 'var(--border-strong)',
            color: 'var(--accent-ice)',
          }}
        >
          {formatPrice(beat.licenses.mp3.priceUsd, currency)}
        </button>
      </div>
    </article>
  );
};
