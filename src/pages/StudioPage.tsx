import React, { useState } from 'react';
import {
  AudioLines,
  CheckCircle2,
  FileArchive,
  FileAudio,
  Layers,
  Play,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { useApp } from '../context/AppContext';
import { Genre } from '../types/klave';
import { formatCompactNumber, formatPrice } from '../utils/format';
import { getUploadSignature, directUploadToCloudinary } from '../lib/api';
import { db, collection, doc, setDoc, serverTimestamp } from '../lib/firebase';

export const StudioPage: React.FC = () => {
  const {
    currentUser,
    userProfile,
    beats,
    refreshBeats,
    currency,
    showToast,
    setNeroOpen,
    playBeat,
    openAuthModal,
  } = useApp();

  const [title, setTitle] = useState('LAGOS VELVET');
  const [genre, setGenre] = useState<Genre>('Afrobeats');
  const [bpm, setBpm] = useState(110);
  const [musicalKey, setMusicalKey] = useState('Am');
  const [standardPrice, setStandardPrice] = useState(29);
  const [exclusivePrice, setExclusivePrice] = useState(299);

  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [stemsFile, setStemsFile] = useState<File | null>(null);
  const [stemCount, setStemCount] = useState(16);

  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const myCatalog = beats.filter(
    (b) => currentUser && b.producerId === currentUser.uid
  );

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      openAuthModal('signin');
      return;
    }

    if (!masterFile) {
      showToast('Select a Stereo Master Audio (.wav / .mp3) file.', 'info');
      return;
    }

    // Minimum pricing validation (enforced by firestore.rules: $7 standard, $100 exclusive)
    if (standardPrice < 7) {
      showToast('Standard lease price must be at least $7 (firestore.rules minimum)', 'info');
      return;
    }
    if (exclusivePrice < 100) {
      showToast('Exclusive rights price must be at least $100 (firestore.rules minimum)', 'info');
      return;
    }

    try {
      setUploading(true);
      setUploadStep('Signing upload request...');

      // 1. Get upload signature from /api/upload
      const sigData = await getUploadSignature(masterFile.name, 'beat');

      setUploadStep('Uploading audio directly to Cloudinary...');
      // 2. Direct upload to Cloudinary (authenticated type)
      const uploadResult = await directUploadToCloudinary(masterFile, sigData, true);

      setUploadStep('Saving beat to Firestore...');
      // 3. Save beat doc to Firestore
      const beatDocRef = doc(collection(db, 'beats'));
      await setDoc(beatDocRef, {
        title: title.trim(),
        prod: userProfile?.displayName || currentUser.displayName || 'Producer',
        producerName: userProfile?.displayName || currentUser.displayName || 'Producer',
        producerId: currentUser.uid,
        price: Number(standardPrice),
        exclPrice: Number(exclusivePrice),
        audioUrl: uploadResult.secure_url,
        previewUrl: sigData.previewUrl || uploadResult.secure_url,
        soldExclusive: false,
        bpm: Number(bpm),
        genre,
        musicalKey,
        stemsVerified: Boolean(stemsFile),
        stemCount: Number(stemCount),
        tags: [genre.toLowerCase(), 'human-made', 'stems-verified'],
        createdAt: serverTimestamp(),
      });

      // 4. Refresh live catalog
      await refreshBeats();

      setSubmitted(true);
      showToast(`"${title}" published and listed in marketplace!`, 'success');
      setMasterFile(null);
      setStemsFile(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Publish error:', e);
      showToast(e.message || 'Failed to publish beat', 'info');
    } finally {
      setUploading(false);
      setUploadStep('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pt-6 sm:px-6">
      <div
        className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
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

      {!currentUser && (
        <div
          className="flex items-center justify-between rounded-xl border p-4"
          style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--border-strong)' }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" style={{ color: 'var(--accent-ice)' }} />
            <div>
              <div className="text-xs font-bold text-white">Sign in required to publish beats</div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Sign in or register as a Producer to upload beats directly to Cloudinary and Firestore.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            Sign In
          </button>
        </div>
      )}

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
                required
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

            <div>
              <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                Standard Lease ($ USD, Min $7)
              </label>
              <input
                type="number"
                min={7}
                value={standardPrice}
                onChange={(e) => setStandardPrice(Number(e.target.value))}
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
                Exclusive Rights ($ USD, Min $100)
              </label>
              <input
                type="number"
                min={100}
                value={exclusivePrice}
                onChange={(e) => setExclusivePrice(Number(e.target.value))}
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
                backgroundColor: masterFile ? 'var(--accent-soft)' : 'var(--bg-surface)',
                borderColor: masterFile ? 'var(--border-strong)' : 'var(--border-subtle)',
              }}
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold">1. Stereo Master (.wav / .mp3)</div>
                <div
                  className="mt-0.5 truncate font-mono-tech text-[11px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {masterFile ? masterFile.name : 'Choose stereo audio file...'}
                </div>
              </div>
              <input
                type="file"
                accept=".wav,.mp3,.aif,.flac"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMasterFile(file);
                    setSubmitted(false);
                  }
                }}
                className="hidden"
              />
              {masterFile ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <FileAudio className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              )}
            </label>

            <label
              className="flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition"
              style={{
                backgroundColor: stemsFile ? 'var(--accent-soft)' : 'var(--bg-surface)',
                borderColor: stemsFile ? 'var(--border-strong)' : 'var(--border-subtle)',
              }}
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold">2. Trackout Stems (.zip)</div>
                <div
                  className="mt-0.5 truncate font-mono-tech text-[11px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {stemsFile ? stemsFile.name : 'Choose isolated stems archive...'}
                </div>
              </div>
              <input
                type="file"
                accept=".zip,.rar,.7z"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setStemsFile(file);
                    setSubmitted(false);
                  }
                }}
                className="hidden"
              />
              <FileArchive
                className="h-4 w-4 shrink-0"
                style={{ color: stemsFile ? 'var(--accent-bright)' : 'var(--text-muted)' }}
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label
              className="flex items-center gap-2 font-mono-tech text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
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
              disabled={uploading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{uploadStep || 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{submitted ? 'Listed on Store' : 'Verify Stems & Publish'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggested Tier Prices */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="font-display text-base font-bold">Pricing Breakdown ({genre})</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Calculated license rates for {bpm} BPM instrumental with {stemCount} isolated stems.
          </p>
          <div className="mt-4 divide-y font-mono-tech text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
            {[
              { name: 'MP3 Lease', usd: standardPrice },
              { name: 'WAV Lease', usd: Math.round(standardPrice * 1.6) },
              { name: `Trackout (${stemCount} Stems)`, usd: Math.round(standardPrice * 2.8) },
              { name: 'Exclusive Rights', usd: exclusivePrice },
            ].map((row) => (
              <div
                key={row.name}
                className="flex justify-between py-2.5"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{row.name}</span>
                <span className="font-bold">{formatPrice(row.usd, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Producer Uploaded Beats List */}
      <section className="space-y-2">
        <div className="font-mono-tech text-xs" style={{ color: 'var(--text-muted)' }}>
          Your Uploaded Beats {myCatalog.length > 0 && `(${myCatalog.length})`}
        </div>
        {myCatalog.length === 0 ? (
          <div
            className="rounded-lg border p-6 text-center text-xs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {currentUser ? 'No beats uploaded on this account yet.' : 'Sign in to view your catalog.'}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {myCatalog.map((beat) => (
              <div
                key={beat.id}
                className="flex items-center justify-between py-3 text-xs"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
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
        )}
      </section>
    </div>
  );
};
