import React, { useMemo, useState } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import { BeatRow } from '../components/beats/BeatRow';
import { useApp } from '../context/AppContext';
import { MOOD_OPTIONS } from '../data/catalog';
import { Genre, MoodTag } from '../types/klave';
import { pluralize } from '../utils/format';

const GENRES: Genre[] = ['Afrobeats', 'Trap', 'Drill', 'Boom Bap'];
const KEYS = ['All', 'Am', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dm', 'Eb', 'Em', 'Fm', 'F#m', 'Gm'];

export const BrowsePage: React.FC = () => {
  const { searchQuery, setSearchQuery, beats } = useApp();

  const [selectedGenre, setSelectedGenre] = useState<'All' | Genre>('All');
  const [selectedMood, setSelectedMood] = useState<'All' | MoodTag>('All');
  const [selectedKey, setSelectedKey] = useState<string>('All');
  const [exclusiveOnly, setExclusiveOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'price-asc' | 'price-desc' | 'bpm'>('trending');

  const genreCounts = useMemo(() => {
    const map: Record<Genre, number> = { Trap: 0, Drill: 0, Afrobeats: 0, 'Boom Bap': 0 };
    beats.forEach((b) => {
      if (map[b.genre] !== undefined) {
        map[b.genre] += 1;
      }
    });
    return map;
  }, [beats]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedMood('All');
    setSelectedKey('All');
    setExclusiveOnly(false);
    setSortBy('trending');
  };

  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = beats.filter((beat) => {
      if (selectedGenre !== 'All' && beat.genre !== selectedGenre) return false;
      if (selectedMood !== 'All' && !beat.moods.includes(selectedMood)) return false;
      if (selectedKey !== 'All' && beat.musicalKey !== selectedKey) return false;
      if (exclusiveOnly && !beat.exclusiveAvailable) return false;

      if (q) {
        const match =
          beat.title.toLowerCase().includes(q) ||
          beat.producerName.toLowerCase().includes(q) ||
          beat.genre.toLowerCase().includes(q) ||
          beat.tags.some((t) => t.toLowerCase().includes(q)) ||
          String(beat.bpm).includes(q);
        if (!match) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.licenses.mp3.priceUsd - b.licenses.mp3.priceUsd;
      if (sortBy === 'price-desc') return b.licenses.mp3.priceUsd - a.licenses.mp3.priceUsd;
      if (sortBy === 'bpm') return a.bpm - b.bpm;
      if (sortBy === 'newest') return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      return b.plays - a.plays;
    });
  }, [searchQuery, selectedGenre, selectedMood, selectedKey, exclusiveOnly, sortBy]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pt-6 sm:px-6">
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Search Beats</h1>

        {/* Search + Filter Controls */}
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, producer, BPM, or tag..."
              className="h-10 w-full rounded-md border pr-9 pl-10 text-sm outline-none transition focus:border-blue-500"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by musical key"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="h-10 rounded-md border px-3 font-mono-tech text-xs outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {KEYS.map((k) => (
                <option key={k} value={k}>
                  {k === 'All' ? 'Key: Any' : `Key: ${k}`}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by mood"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value as 'All' | MoodTag)}
              className="h-10 rounded-md border px-3 text-xs font-semibold outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="All">Mood: All</option>
              {MOOD_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  Mood: {m.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setExclusiveOnly((v) => !v)}
              className="h-10 cursor-pointer rounded-md border px-3 font-mono-tech text-xs font-semibold transition"
              style={{
                backgroundColor: exclusiveOnly ? 'var(--accent-primary)' : 'var(--bg-surface)',
                borderColor: exclusiveOnly ? 'var(--accent-primary)' : 'var(--border-subtle)',
                color: exclusiveOnly ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              Exclusives Only
            </button>

            <select
              aria-label="Sort beats"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 rounded-md border px-3 text-xs font-semibold outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="trending">Sort: Trending</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="bpm">Tempo: BPM</option>
            </select>
          </div>
        </div>

        {/* Genre Cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {GENRES.map((genre) => {
            const active = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(active ? 'All' : genre)}
                className="flex cursor-pointer items-center justify-between rounded-lg border px-3.5 py-2.5 text-left transition"
                style={{
                  backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
                  borderColor: active ? 'var(--border-strong)' : 'var(--border-subtle)',
                }}
              >
                <span className="text-xs font-bold">{genre}</span>
                <span className="font-mono-tech text-xs" style={{ color: active ? 'var(--accent-ice)' : 'var(--text-muted)' }}>
                  {pluralize(genreCounts[genre], 'beat')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="font-mono-tech text-xs" style={{ color: 'var(--text-muted)' }}>
            {pluralize(results.length, 'beat')}
          </span>
          {(selectedGenre !== 'All' || selectedMood !== 'All' || selectedKey !== 'All' || exclusiveOnly || searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex cursor-pointer items-center gap-1 font-mono-tech text-xs hover:underline"
              style={{ color: 'var(--accent-ice)' }}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold">No beats match the active filters</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 cursor-pointer rounded-md px-4 py-2 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div>
            {results.map((beat, idx) => (
              <BeatRow key={beat.id} beat={beat} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
