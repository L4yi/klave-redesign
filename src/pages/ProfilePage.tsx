import React, { useState } from 'react';
import {
  AudioLines,
  Bookmark,
  Download,
  LogOut,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { BeatRow } from '../components/beats/BeatRow';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/format';
import { getFullAudioUrl } from '../lib/api';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    userProfile,
    role,
    setRole,
    openAuthModal,
    signOutUser,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    compactMode,
    setCompactMode,
    reduceMotion,
    setReduceMotion,
    savedBeatIds,
    followedProducers,
    purchasedLicenses,
    beats,
    showToast,
    openNeroWithMood,
    navigate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'licenses' | 'saved' | 'settings'>('licenses');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const savedBeats = beats.filter((b) => savedBeatIds.includes(b.id));

  const handleDownloadFullAudio = async (beatId: string, beatTitle: string) => {
    try {
      setDownloadingId(beatId);
      const { url } = await getFullAudioUrl(beatId);
      if (url) {
        window.open(url, '_blank');
        showToast(`Opening full quality audio for "${beatTitle}"`, 'success');
      } else {
        showToast('Download link not available yet', 'info');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      showToast(e.message || 'Only verified purchasers or producers can access full audio', 'info');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!currentUser && role === 'guest') {
    return (
      <div className="mx-auto max-w-md px-4 pt-12 sm:px-6">
        <div
          className="rounded-xl border p-6 text-center"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-ice)' }}
          >
            <UserCheck className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-extrabold">Sign in to KLAVE</h1>
          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Access purchased uncompressed stems, saved beats, and producer studio tools.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="cursor-pointer rounded-md py-2.5 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="cursor-pointer rounded-md border py-2.5 text-xs font-semibold"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pt-6 sm:px-6">
      <section
        className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-[11px] uppercase font-bold" style={{ color: 'var(--accent-ice)' }}>
              {role} account
            </span>
            {userProfile?.tier === 'pro15' && (
              <span
                className="rounded px-1.5 py-0.5 font-mono-tech text-[10px] font-bold uppercase"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
              >
                PRO
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-extrabold">{displayName}</h1>
          <p className="mt-0.5 font-mono-tech text-xs" style={{ color: 'var(--text-secondary)' }}>
            {currentUser?.email} · {followedProducers.length} Following · {savedBeatIds.length} Saved ·{' '}
            {purchasedLicenses.length} Licenses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRole(role === 'artist' ? 'producer' : 'artist')}
            className="cursor-pointer rounded-md border px-3.5 py-2 text-xs font-semibold"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Switch to {role === 'artist' ? 'Producer' : 'Artist'} View
          </button>
          {role === 'producer' && (
            <button
              type="button"
              onClick={() => navigate('studio')}
              className="cursor-pointer rounded-md px-3.5 py-2 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Upload Beats
            </button>
          )}
          <button
            type="button"
            onClick={signOutUser}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3.5 py-2 text-xs font-semibold"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'licenses', label: `Purchased Licenses (${purchasedLicenses.length})` },
          { id: 'saved', label: `Saved Beats (${savedBeats.length})` },
          { id: 'settings', label: 'Preferences' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="cursor-pointer rounded-md border px-3.5 py-1.5 text-xs font-semibold transition"
              style={{
                backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
                borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                color: active ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'licenses' && (
        <div>
          {purchasedLicenses.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold">No purchased licenses yet</p>
              <button
                type="button"
                onClick={() => openNeroWithMood('Dark')}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <AudioLines className="h-3.5 w-3.5" />
                Match Beats with NERO
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {purchasedLicenses.map((lic) => (
                <div
                  key={lic.id}
                  className="flex items-center justify-between py-3.5"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div>
                    <div className="text-sm font-bold">{lic.beatTitle}</div>
                    <div className="font-mono-tech text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {lic.tierName} · prod. {lic.producerName} · {lic.purchasedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tech text-sm font-bold">
                      {formatPrice(lic.priceUsd, currency)}
                    </span>
                    <button
                      type="button"
                      disabled={downloadingId === lic.id}
                      onClick={() => handleDownloadFullAudio(lic.id, lic.beatTitle)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                      {downloadingId === lic.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download Audio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {savedBeats.length === 0 ? (
            <div className="py-12 text-center">
              <Bookmark className="mx-auto mb-2 h-6 w-6" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-bold">No saved beats yet</p>
            </div>
          ) : (
            savedBeats.map((beat, idx) => <BeatRow key={beat.id} beat={beat} index={idx} />)
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <div
            className="rounded-xl border p-5 space-y-2"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <h2 className="font-display text-base font-bold">Display Preferences</h2>
            <p className="text-xs pb-2" style={{ color: 'var(--text-secondary)' }}>
              Customize your storefront interface and currency display.
            </p>
            {[
              {
                label: 'Light Mode',
                desc: 'Switch to light color scheme',
                checked: theme === 'light',
                onChange: toggleTheme,
              },
              {
                label: 'Show Prices in Naira (₦)',
                desc: 'Display ₦ across the store',
                checked: currency === 'NGN',
                onChange: () => setCurrency(currency === 'NGN' ? 'USD' : 'NGN'),
              },
              {
                label: 'Compact Beat List',
                desc: 'Tighter rows, more beats on screen',
                checked: compactMode,
                onChange: () => setCompactMode(!compactMode),
              },
              {
                label: 'Reduce Motion',
                desc: 'Turn off animations and transitions',
                checked: reduceMotion,
                onChange: () => setReduceMotion(!reduceMotion),
              },
            ].map((item) => (
              <label
                key={item.label}
                className="flex cursor-pointer items-center justify-between border-b py-3 last:border-b-0"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={item.onChange}
                  className="h-4 w-4 accent-blue-600"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
