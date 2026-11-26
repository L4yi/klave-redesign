import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  AudioLines,
  Check,
  MapPin,
  Pause,
  Play,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { BeatCard } from '../components/beats/BeatCard';
import { BeatRow } from '../components/beats/BeatRow';
import { useApp } from '../context/AppContext';
import { BEATS, MOOD_OPTIONS, PRODUCERS } from '../data/catalog';
import { Genre, MoodTag } from '../types/klave';
import { generateCoverDataUri, getProducerPortrait } from '../utils/artwork';
import { StemChannel } from '../utils/audioSynth';
import { formatCompactNumber, formatPrice, pluralize } from '../utils/format';

const GENRES: ('All' | Genre)[] = ['All', 'Afrobeats', 'Trap', 'Drill', 'Boom Bap'];

const STEM_CHANNELS: { id: StemChannel; label: string }[] = [
  { id: 'drums', label: 'Drums' },
  { id: 'bass', label: '808 / Bass' },
  { id: 'melody', label: 'Melody' },
  { id: 'hats', label: 'Hi-Hats' },
];

export const DiscoverPage: React.FC = () => {
  const {
    beats,
    currentBeat,
    isPlaying,
    activeStems,
    toggleStem,
    playBeat,
    openLicenseModal,
    currency,
    navigate,
    openNeroWithMood,
    setTrustModalOpen,
    followedProducers,
    toggleFollowProducer,
  } = useApp();

  const [selectedGenre, setSelectedGenre] = useState<'All' | Genre>('All');
  const [activeMood, setActiveMood] = useState<'All' | MoodTag>('All');

  // Trending Now spotlight beat (defaults to #1 trending beat, or updates when user plays a beat)
  const trendingBeat = beats[0] || BEATS[0];
  const activeDeckBeat = currentBeat ?? trendingBeat;
  const isTrendingPlaying = currentBeat?.id === activeDeckBeat.id && isPlaying;
  const deckCover = useMemo(
    () => generateCoverDataUri(activeDeckBeat.coverSeed),
    [activeDeckBeat.coverSeed]
  );

  // Producer of the Week: Northhh (#2 in roster, 6 beats, 27.9k plays)
  const producerOfWeek = PRODUCERS[1];
  const powBeat = beats.find((b) => b.id === producerOfWeek.featuredBeatId) ?? beats[1] ?? BEATS[1];
  const isPowPlaying = currentBeat?.id === powBeat.id && isPlaying;
  const isFollowingPow = followedProducers.includes(producerOfWeek.id);

  const filteredBeats = useMemo(() => {
    return beats.filter((b) => {
      if (selectedGenre !== 'All' && b.genre !== selectedGenre) return false;
      if (activeMood !== 'All' && !b.moods.includes(activeMood)) return false;
      return true;
    });
  }, [selectedGenre, activeMood, beats]);

  const newReleases = useMemo(() => beats.slice(0, 4), [beats]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pt-5 sm:px-6">
      {/* 1. 100% Human-Made Beats / No AI Beats Trust Banner */}
      <section
        className="flex flex-col justify-between gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:px-5"
        style={{
          backgroundColor: 'var(--accent-soft)',
          borderColor: 'var(--border-strong)',
        }}
      >
        <div className="flex items-start gap-3 sm:items-center">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white sm:mt-0"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-xs font-extrabold tracking-wide uppercase sm:text-sm">
                100% Human-Made Beats · No AI Beats
              </span>
              <span
                className="rounded px-1.5 py-0.5 font-mono-tech text-[10px] font-semibold"
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--accent-ice)' }}
              >
                STEM-VERIFIED
              </span>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Every producer uploads raw multi-track stems before a beat goes live. Zero AI-generated tracks.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 pl-11 sm:pl-0">
          <button
            type="button"
            onClick={() => setTrustModalOpen(true)}
            className="cursor-pointer text-xs font-semibold underline-offset-4 hover:underline"
            style={{ color: 'var(--accent-ice)' }}
          >
            How we verify
          </button>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <button
            type="button"
            onClick={() => navigate('studio')}
            className="cursor-pointer text-xs font-semibold underline-offset-4 hover:underline"
            style={{ color: 'var(--text-primary)' }}
          >
            Sell your beats →
          </button>
        </div>
      </section>

      {/* 2. Top Showcase: TRENDING NOW + PRODUCER OF THE WEEK */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Left Card: TRENDING NOW */}
        <div
          className="flex flex-col justify-between rounded-xl border p-5 sm:p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'var(--accent-bright)' }}
                />
                <span
                  className="font-mono-tech text-xs font-bold tracking-wider uppercase"
                  style={{ color: 'var(--accent-ice)' }}
                >
                  {activeDeckBeat.id === trendingBeat.id ? 'Trending Now' : 'Now Playing'}
                </span>
              </div>
              <span className="font-mono-tech text-xs" style={{ color: 'var(--text-secondary)' }}>
                {activeDeckBeat.stemCount} Stems Included
              </span>
            </div>

            {/* Cover + Track Details */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border sm:h-32 sm:w-32"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <img src={deckCover} alt={activeDeckBeat.title} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => playBeat(activeDeckBeat)}
                  aria-label={isTrendingPlaying ? `Pause ${activeDeckBeat.title}` : `Play ${activeDeckBeat.title}`}
                  className="absolute inset-0 m-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-white shadow-lg transition hover:scale-105"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  {isTrendingPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  )}
                </button>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <h1 className="font-display truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {activeDeckBeat.title}
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Produced by{' '}
                    <button
                      type="button"
                      onClick={() => navigate('producer', activeDeckBeat.producerId)}
                      className="cursor-pointer font-semibold hover:underline"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {activeDeckBeat.producerName}
                    </button>{' '}
                    · {activeDeckBeat.genre}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono-tech text-xs">
                  <span
                    className="rounded px-2 py-0.5"
                    style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                  >
                    {activeDeckBeat.bpm} BPM
                  </span>
                  <span
                    className="rounded px-2 py-0.5"
                    style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                  >
                    Key: {activeDeckBeat.musicalKey}
                  </span>
                  <span
                    className="rounded px-2 py-0.5"
                    style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                  >
                    {formatCompactNumber(activeDeckBeat.plays)} plays
                  </span>
                </div>
              </div>
            </div>

            {/* User-Friendly Live Stem Switcher */}
            <div
              className="rounded-lg border p-3"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Preview isolated stems (click to mute or unmute):
                </span>
                <span className="font-mono-tech text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {activeDeckBeat.daw}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {STEM_CHANNELS.map((stem) => {
                  const active = activeStems[stem.id];
                  return (
                    <button
                      key={stem.id}
                      type="button"
                      onClick={() => {
                        toggleStem(stem.id);
                        if (!isTrendingPlaying) playBeat(activeDeckBeat);
                      }}
                      className="flex cursor-pointer items-center justify-between rounded border px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition"
                      style={{
                        backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                        borderColor: active ? 'var(--border-strong)' : 'var(--border-subtle)',
                        color: active ? 'var(--accent-ice)' : 'var(--text-muted)',
                      }}
                    >
                      <span>{stem.label}</span>
                      <span className="text-[10px]">{active ? 'ON' : 'OFF'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={() => playBeat(activeDeckBeat)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold transition"
              style={{
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              {isTrendingPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              {isTrendingPlaying ? 'Pause Preview' : 'Play 30s Preview'}
            </button>

            <button
              type="button"
              onClick={() => openLicenseModal(activeDeckBeat)}
              className="cursor-pointer rounded-md px-4 py-2 font-mono-tech text-xs font-semibold text-white transition hover:opacity-95"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Buy / License · {formatPrice(activeDeckBeat.licenses.mp3.priceUsd, currency)}
            </button>
          </div>
        </div>

        {/* Right Card: PRODUCER OF THE WEEK */}
        <div
          className="flex flex-col justify-between rounded-xl border p-5 sm:p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-mono-tech text-xs font-bold tracking-wider uppercase"
                style={{ color: 'var(--accent-ice)' }}
              >
                Producer of the Week
              </span>
              <span
                className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono-tech text-[10px] font-semibold"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-ice)' }}
              >
                <ShieldCheck className="h-3 w-3" />
                Verified Stems
              </span>
            </div>

            {/* Producer Identity */}
            <div className="flex items-center gap-3.5">
              <img
                src={getProducerPortrait(producerOfWeek.id)}
                alt={producerOfWeek.displayName}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => navigate('producer', producerOfWeek.id)}
                    className="font-display cursor-pointer truncate text-xl font-extrabold hover:underline"
                  >
                    {producerOfWeek.displayName}
                  </button>
                  <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: 'var(--accent-ice)' }} />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {producerOfWeek.location}
                  </span>
                  <span>·</span>
                  <span className="font-mono-tech">{producerOfWeek.primaryGenre}</span>
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {producerOfWeek.bio}
            </p>

            {/* Quick Producer Stats */}
            <div
              className="grid grid-cols-3 gap-2 rounded-lg border p-2.5 text-center font-mono-tech text-xs"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div>
                <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Beats
                </span>
                <span className="font-bold">{producerOfWeek.beatCount}</span>
              </div>
              <div>
                <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Plays
                </span>
                <span className="font-bold">{formatCompactNumber(producerOfWeek.totalPlays)}</span>
              </div>
              <div>
                <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Followers
                </span>
                <span className="font-bold">
                  {formatCompactNumber(producerOfWeek.followers + (isFollowingPow ? 1 : 0))}
                </span>
              </div>
            </div>

            {/* Featured Beat Quick-Audition */}
            <div
              className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: isPowPlaying ? 'var(--border-strong)' : 'var(--border-subtle)',
              }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => playBeat(powBeat)}
                  aria-label={isPowPlaying ? `Pause ${powBeat.title}` : `Play ${powBeat.title}`}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  {isPowPlaying ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold"> Top Beat: {powBeat.title}</div>
                  <div className="font-mono-tech text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {powBeat.bpm} BPM · {powBeat.musicalKey} · {powBeat.stemCount} stems
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openLicenseModal(powBeat)}
                className="shrink-0 cursor-pointer rounded border px-2.5 py-1 font-mono-tech text-xs font-semibold"
                style={{
                  borderColor: 'var(--border-strong)',
                  color: 'var(--accent-ice)',
                }}
              >
                {formatPrice(powBeat.licenses.mp3.priceUsd, currency)}
              </button>
            </div>
          </div>

          {/* Producer Actions */}
          <div
            className="mt-4 flex items-center justify-between gap-2.5 border-t pt-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={() => toggleFollowProducer(producerOfWeek.id)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3.5 py-2 text-xs font-semibold transition"
              style={{
                backgroundColor: isFollowingPow ? 'var(--accent-soft)' : 'transparent',
                borderColor: isFollowingPow ? 'var(--border-strong)' : 'var(--border-subtle)',
                color: isFollowingPow ? 'var(--accent-ice)' : 'var(--text-primary)',
              }}
            >
              {isFollowingPow ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              {isFollowingPow ? 'Following' : 'Follow'}
            </button>

            <button
              type="button"
              onClick={() => navigate('producer', producerOfWeek.id)}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-4 py-2 text-xs font-semibold transition hover:border-blue-500"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <span>View {producerOfWeek.displayName}&apos;s Beats</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Beat Catalog + Genre & Mood Filters */}
      <section className="space-y-4">
        <div
          className="flex flex-col justify-between gap-3 border-b pb-3.5 lg:flex-row lg:items-center"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {/* Genre Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {GENRES.map((genre) => {
              const active = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold transition"
                  style={{
                    backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {genre === 'All' ? 'All Beats' : genre}
                </button>
              );
            })}
          </div>

          {/* Mood Chips + NERO Match */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono-tech text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Mood:
            </span>
            {MOOD_OPTIONS.slice(0, 6).map((mood) => {
              const selected = activeMood === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setActiveMood(selected ? 'All' : (mood.id as MoodTag))}
                  className="cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition"
                  style={{
                    backgroundColor: selected ? 'var(--accent-soft)' : 'transparent',
                    borderColor: selected ? 'var(--border-strong)' : 'var(--border-subtle)',
                    color: selected ? 'var(--accent-ice)' : 'var(--text-secondary)',
                  }}
                >
                  {mood.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => openNeroWithMood(activeMood === 'All' ? 'Dark' : activeMood)}
              className="ml-1 inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 font-mono-tech text-xs font-semibold"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'var(--border-strong)',
                color: 'var(--accent-ice)',
              }}
            >
              <AudioLines className="h-3 w-3" />
              NERO Match
            </button>
          </div>
        </div>

        {/* Column Header */}
        <div
          className="hidden grid-cols-[2rem_2.75rem_minmax(0,1.7fr)_minmax(0,1.1fr)_8.5rem_5.5rem_auto] items-center gap-5 border-b px-3 pb-2 font-mono-tech text-[11px] uppercase md:grid"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <span className="text-center">#</span>
          <span>Cover</span>
          <span>Title / Producer</span>
          <span>Waveform</span>
          <span>BPM / Key</span>
          <span>Genre</span>
          <span className="text-right">License</span>
        </div>

        <div>
          {filteredBeats.map((beat, idx) => (
            <BeatRow key={beat.id} beat={beat} index={idx} />
          ))}
        </div>
      </section>

      {/* 4. New Releases (4-Up Photographic Sleeves) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="font-display text-lg font-bold tracking-tight">New Beats</h2>
          <button
            type="button"
            onClick={() => navigate('browse')}
            className="inline-flex cursor-pointer items-center gap-1 font-mono-tech text-xs hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            Browse all {pluralize(BEATS.length, 'beat')} <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {newReleases.map((beat) => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      </section>

      {/* 5. Top Producers Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="font-display text-lg font-bold tracking-tight">Top Producers</h2>
          <button
            type="button"
            onClick={() => navigate('producers')}
            className="inline-flex cursor-pointer items-center gap-1 font-mono-tech text-xs hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PRODUCERS.map((producer) => (
            <button
              key={producer.id}
              type="button"
              onClick={() => navigate('producer', producer.id)}
              className="group flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition hover:border-blue-500/40"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <img
                src={getProducerPortrait(producer.id)}
                alt={producer.displayName}
                className="h-10 w-10 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs font-bold">{producer.displayName}</span>
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent-ice)' }} />
                </div>
                <div className="truncate font-mono-tech text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {producer.primaryGenre} · {pluralize(producer.beatCount, 'beat')}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
