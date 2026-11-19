import React, { useState } from 'react';
import { AudioLines, CheckCircle2, FileArchive, FileAudio, Layers, Play, ShieldCheck } from 'lucide-react';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { useApp } from '../context/AppContext';
import { BEATS } from '../data/catalog';
import { Genre } from '../types/klave';
import { formatCompactNumber, formatPrice } from '../utils/format';

export const StudioPage: React.FC = () => {
  const { currency, showToast, setNeroOpen, playBeat } = useApp();

  const [title, setTitle] = useState('LAGOS VELVET');
  const [genre, setGenre] = useState<Genre>('Afrobeats');
  const [bpm, setBpm] = useState(110);
  const [musicalKey, setMusicalKey] = useState('Am');
  const [masterFileName, setMasterFileName] = useState<string>('lagos_velvet_master_24bit.wav');
  const [stemsFileName, setStemsFileName] = useState<string>('');
  const [stemCount, setStemCount] = useState(16);
  const [submitted, setSubmitted] = useState(false);

  const myCatalog = BEATS.slice(0, 5);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterFileName || !stemsFileName) {
      showToast('Select both a Stereo Master WAV and a Stems ZIP file.');
      return;
    }
    setSubmitted(true);
    showToast(`"${title}" stems verified and listed.`, 'success');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pt-6 sm:px-6">
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Sell Beats</h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Producers upload isolated stems with every beat to verify human production.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNeroOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3.5 py-2 font-mono-tech text-xs font-semibold"
          style={{
            backgroundColor: 'var(--accent-soft)',
            borderColor: 'var(--border-strong)',
            color: 'var(--accent-ice)',
          }}
        >
          <AudioLines className="h-3.5 w-3.5" />
          NERO Pricing Guide
        </button>
      </div>

      {/* Upload + Pricing Matrix */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <form onSubmit={handlePublish} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                Beat Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSubmitted(false);
                }}
                className="mt-1.5 h-10 w-full rounded-md border px-3 text-sm font-semibold outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre)}
                className="mt-1.5 h-10 w-full rounded-md border px-3 text-sm font-semibold outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="Afrobeats">Afrobeats</option>
                <option value="Trap">Trap</option>
                <option value="Drill">Drill</option>
                <option value="Boom Bap">Boom Bap</option>
              </select>
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                BPM
              </label>
              <input
                type="number"
                min={60}
                max={200}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="mt-1.5 h-10 w-full rounded-md border px-3 font-mono-tech text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                Key
              </label>
              <input
                type="text"
                value={musicalKey}
                onChange={(e) => setMusicalKey(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border px-3 font-mono-tech text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Real File Inputs */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className="flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition"
              style={{
                backgroundColor: masterFileName ? 'var(--accent-soft)' : 'var(--bg-surface)',
                borderColor: masterFileName ? 'var(--border-strong)' : 'var(--border-subtle)',
              }}
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold">1. Stereo Master (.wav / .mp3)</div>
                <div className="mt-0.5 truncate font-mono-tech text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {masterFileName || 'Choose stereo audio file...'}
                </div>
              </div>
              <input
                type="file"
                accept=".wav,.mp3,.aif,.flac"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMasterFileName(file.name);
                    setSubmitted(false);
                  }
                }}
                className="hidden"
              />
              {masterFileName ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--accent-bright)' }} />
              ) : (
                <FileAudio className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              )}
            </label>

            <label
              className="flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition"
              style={{
                backgroundColor: stemsFileName ? 'var(--accent-soft)' : 'var(--bg-surface)',
                borderColor: stemsFileName ? 'var(--border-strong)' : 'var(--border-subtle)',
              }}
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold">2. Trackout Stems (.zip)</div>
                <div className="mt-0.5 truncate font-mono-tech text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {stemsFileName || 'Choose isolated stems archive...'}
                </div>
              </div>
              <input
                type="file"
                accept=".zip,.rar,.7z"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setStemsFileName(file.name);
                    setSubmitted(false);
                  }
                }}
                className="hidden"
              />
              <FileArchive className="h-4 w-4 shrink-0" style={{ color: stemsFileName ? 'var(--accent-bright)' : 'var(--text-muted)' }} />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-mono-tech text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Layers className="h-4 w-4" />
              <span>Stem tracks in ZIP:</span>
              <input
                type="number"
                min={4}
                max={64}
                value={stemCount}
                onChange={(e) => setStemCount(Number(e.target.value))}
                className="w-16 rounded-md border px-2 py-1 font-mono-tech text-xs"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              />
            </label>

            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <ShieldCheck className="h-4 w-4" />
              {submitted ? 'Listed on Store' : 'Verify Stems & Publish'}
            </button>
          </div>
        </form>

        {/* Suggested Tier Prices */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="font-display text-base font-bold">Suggested License Pricing ({genre})</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Standard rates for {bpm} BPM instrumentals with {stemCount} stems.
          </p>
          <div className="mt-4 divide-y font-mono-tech text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
            {[
              { name: 'MP3 Lease', usd: 25 },
              { name: 'WAV Lease', usd: 45 },
              { name: `Trackout (${stemCount} Stems)`, usd: 110 },
              { name: 'Exclusive Rights', usd: 650 },
            ].map((row) => (
              <div key={row.name} className="flex justify-between py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{row.name}</span>
                <span className="font-bold">{formatPrice(row.usd, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Producer Beats List */}
      <section className="space-y-2">
        <div className="font-mono-tech text-xs" style={{ color: 'var(--text-muted)' }}>
          Your Uploaded Beats
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {myCatalog.map((beat) => (
            <div key={beat.id} className="flex items-center justify-between py-3 text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => playBeat(beat)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--accent-ice)' }}
                >
                  <Play className="ml-0.5 h-3 w-3 fill-current" />
                </button>
                <span className="font-bold">{beat.title}</span>
                <VerifiedBadge stemCount={beat.stemCount} compact />
              </div>
              <div className="flex items-center gap-5 font-mono-tech">
                <span style={{ color: 'var(--text-muted)' }}>{formatCompactNumber(beat.plays)} plays</span>
                <span className="font-bold">{formatPrice(beat.licenses.mp3.priceUsd, currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
